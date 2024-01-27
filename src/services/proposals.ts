import { Hex, PublicClient } from 'viem';
import { Address } from 'viem';
import { logger } from '../utils/logger.js';
import { getAddress, forGovernance } from '../utils/viewCalls.js';
import { CollectionLoaderService } from './service.js';
import { IProposal, ITransaction, Stage, stages } from './types.js';

export class ProposalService extends CollectionLoaderService<
	number,
	IProposal
> {
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

	async handleLoadActive(): Promise<IProposal[]> {
		logger.debug('Loading active proposals');
		const response = await this.client!.multicall({
			contracts: [this.queries!.getQueue(), this.queries!.getDequeue()],
		});
		logger.info(response[0].error);
		logger.info(response[1].error);
		logger.info(response[0].result!.toString());
		logger.info(response[1].result!.toString());
		return [];
	}

	async handleLoad(id: number): Promise<IProposal> {
		logger.debug('Loading proposal ' + id);

		const proposal = await this.loadBaseProposal(id);

		const [description, transactions] = await Promise.all([
			this.loadDescription(proposal),
			this.loadTransactions(proposal),
		]);

		logger.info(proposal);
		logger.info(transactions);

		return {
			...proposal,
			description,
			transactions,
		};
	}

	async loadDescription(
		proposal: Pick<IProposal, 'descriptionUrl' | 'id'>,
	): Promise<string> {
		let response;
		try {
			response = await fetch(proposal.descriptionUrl).then(res => res.text());
		} catch (e) {
			logger.info('Description loading request failed');
			return '';
		}
		let asJson;
		try {
			asJson = JSON.parse(response);
		} catch (e) {
			logger.info('Parsing description as JSON failed');
			return response;
		}

		try {
			const rawUrl = asJson['payload']['blob']['rawBlobUrl'];
			return await fetch(rawUrl).then(res => res.text());
		} catch (e) {
			return '';
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

		const callWithError = response.filter(r => r.status === 'failure');
		if (callWithError.length > 0) {
			logger.info(response.map(r => r.status));
			throw 'Failed to load proposal';
		}

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
