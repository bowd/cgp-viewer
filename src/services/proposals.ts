import { Hex, PublicClient } from 'viem';
import { Address } from 'viem';
import { logger } from '../utils/logger.js';
import { getAddress, forGovernance } from '../utils/viewCalls.js';

enum Stage {
	None = 'None',
	Queued = 'Queued',
	Approval = 'Approval',
	Referendum = 'Referendum',
	Execution = 'Execution',
	Expiration = 'Expiration',
}

const stages: Stage[] = [
	Stage.None,
	Stage.Queued,
	Stage.Approval,
	Stage.Referendum,
	Stage.Execution,
	Stage.Expiration,
];

export interface IProposal {
	id: number;
	proposer: Address;
	deposit: bigint;
	timestamp: number;
	transactionsLength: number;
	networkWeight: bigint;
	descriptionUrl: string;
	approved: boolean;
	description: string;
	transactions: ITransaction[];
	stage: Stage;
	isPassing: boolean;
	isApproved: boolean;

	votes: {
		votesFor: bigint;
		votesAgainst: bigint;
		abstains: bigint;
	};
	upvotes: bigint;
}

export interface ITransaction {
	to: Address;
	value: bigint;
	data: Hex;
}

class ProposalService {
	proposalCache: Map<number, IProposal> = new Map();
	isLoading: Set<number> = new Set();
	promises: Map<number, Promise<IProposal>> = new Map();

	governanceAddress: Address = '0x';
	client: PublicClient | null = null;
	queries: ReturnType<typeof forGovernance> | null = null;

	async init(client: PublicClient) {
		this.client = client;
		this.governanceAddress = await client.readContract(
			getAddress('Governance'),
		);
		this.queries = forGovernance(this.governanceAddress);
	}

	/// @dev Loads a proposal from the blockchain. Made to work with suspense
	load(id: number): IProposal {
		if (this.proposalCache.has(id)) {
			return this.proposalCache.get(id)!;
		}
		if (this.isLoading.has(id)) {
			throw this.promises.get(id)!;
		}

		const promise = new Promise<IProposal>(async (resolve, reject) => {
			try {
				const proposal = await this.handleLoad(id);
				this.proposalCache.set(id, proposal);
				resolve(proposal);
			} catch (e) {
				// Todo Handle error better
				reject(e);
			} finally {
				this.promises.delete(id);
				this.isLoading.delete(id);
			}
		});

		this.promises.set(id, promise);
		this.isLoading.add(id);

		throw promise;
	}

	async handleLoad(id: number): Promise<IProposal> {
		logger.debug('Loading proposal ' + id);

		const proposal = await this.loadBaseProposal(id);
		const transactions = await this.loadTransactions(proposal);

		return {
			...proposal,
			description: await this.loadDescription(proposal),
			transactions: transactions,
		};
	}

	async loadDescription(
		proposal: Pick<IProposal, 'descriptionUrl' | 'id'>,
	): Promise<string> {
		try {
			const response = await fetch(proposal.descriptionUrl).then(res =>
				res.json(),
			);
			const rawUrl = response['payload']['blob']['rawBlobUrl'];
			return await fetch(rawUrl).then(res => res.text());
		} catch (e) {
			logger.error('Failed to load description for proposal ' + proposal.id);
			logger.error(e);
			return await fetch(proposal.descriptionUrl).then(res => res.text());
		}
	}

	async loadBaseProposal(
		id: number,
	): Promise<Omit<IProposal, 'transactions' | 'description'>> {
		const response = await this.client!.multicall({
			contracts: [
				this.queries!.getProposal(id),
				this.queries!.getVotes(id),
				this.queries!.getStage(id),
				this.queries!.isPassing(id),
				this.queries!.isApproved(id),
			],
		});

		logger.debug('Done');

		const callWithError = response.filter(r => r.status === 'failure');
		if (callWithError.length > 0) {
			logger.info(response.map(r => r.status));
			throw 'Failed to load proposal';
		}

		logger.debug('Done');

		const [
			proposer,
			deposit,
			timestamp,
			transactionsLength,
			descriptionUrl,
			networkWeight,
			approved,
		] = response[0].result!;
		const [votesFor, votesAgainst, abstains] = response[1].result!;
		const stage: Stage = stages[Number(response[2].result!)];
		const isPassing = response[3].result!;
		const isApproved = response[4].result!;

		let upvotes = BigInt(0);
		if (stage === Stage.Queued) {
			upvotes = await this.client!.readContract(this.queries!.getUpvotes(id));
		}

		return {
			id: id,
			proposer,
			deposit,
			timestamp: Number(timestamp),
			transactionsLength: Number(transactionsLength),
			descriptionUrl,
			networkWeight,
			approved,
			stage,
			isPassing,
			isApproved,
			votes: { votesFor, votesAgainst, abstains },
			upvotes,
		};
	}

	async loadTransactions(
		proposal: Pick<IProposal, 'id' | 'transactionsLength'>,
	): Promise<ITransaction[]> {
		const txs = await this.client!.multicall({
			contracts: new Array(proposal.transactionsLength)
				.fill(null)
				.map((_, i) => this.queries!.getTransaction(proposal.id, i)),
		});

		const callWithError = txs.filter(r => r.status === 'failure');
		if (callWithError.length > 0) {
			logger.info(txs.map(r => r.status));
			throw 'Failed to load Transactions';
		}

		return txs.map(tx => ({
			value: tx.result![0],
			to: tx.result![1],
			data: tx.result![2],
		}));
	}
}

export const proposalService = new ProposalService();
