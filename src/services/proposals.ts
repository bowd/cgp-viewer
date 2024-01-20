import { Client } from 'viem';
import { readContract } from 'viem/actions';
import { Address } from 'viem';
import { RegistryABI } from '../abis/Registry.js';
import { GovernanceABI } from '../abis/Governance.js';
import { logger } from '../utils/logger.js';

export const loadProposal = (id: number) => {
	if (proposalLoader.proposalCache.has(id)) {
		return proposalLoader.proposalCache.get(id);
	} else if (proposalLoader.isLoading.has(id)) {
		throw proposalLoader.promises.get(id);
	} else {
		const promise = proposalLoader.loadProposal(id);
		proposalLoader.promises.set(id, promise);
		proposalLoader.isLoading.add(id);
		throw promise;
	}
};

export interface Proposal {
	id: number;
	proposer: Address;
	deposit: bigint;
	timestamp: number;
	transactionsLength: number;
	networkWeight: bigint;
	descriptionUrl: string;
	approved: boolean;
	description: string;
	transactions: Transaction[];
}

export interface Transaction {
	to: Address;
	value: bigint;
	data: string;
}

const REGISTRY: Address = '0x000000000000000000000000000000000000ce10';

class ProposalLoader {
	proposalCache: Map<number, Proposal> = new Map();
	isLoading: Set<number> = new Set();
	promises: Map<number, Promise<Proposal>> = new Map();

	governanceAddress: Address = '0x';
	client: Client | null = null;

	async init(client: Client) {
		this.client = client;
		this.governanceAddress = await readContract(client, {
			address: REGISTRY,
			abi: RegistryABI,
			functionName: 'getAddressForStringOrDie',
			args: ['Governance'],
		});
	}

	async loadProposal(id: number): Promise<Proposal> {
		const proposal = await this._loadProposal(id);
		this.isLoading.delete(id);
		this.promises.delete(id);
		this.proposalCache.set(id, proposal);
		return proposal;
	}

	async _loadProposal(id: number): Promise<Proposal> {
		logger.info('Loading proposal ' + id);
		const proposalData = await readContract(this.client!, {
			address: this.governanceAddress,
			abi: GovernanceABI,
			functionName: 'getProposal',
			args: [BigInt(id)],
		});

		const proposal: Omit<Proposal, 'description' | 'transactions'> = {
			id: id,
			proposer: proposalData[0],
			deposit: proposalData[1],
			timestamp: Number(proposalData[2]),
			transactionsLength: Number(proposalData[3]),
			descriptionUrl: proposalData[4],
			networkWeight: proposalData[5],
			approved: proposalData[6],
		};

		let description: string;
		try {
			const descriptionResponse = await fetch(proposal.descriptionUrl).then(
				res => res.json(),
			);
			const rawUrl = descriptionResponse['payload']['blob']['rawBlobUrl'];
			description = await fetch(rawUrl).then(res => res.text());
		} catch (e) {
			logger.error('Failed to load description for proposal ' + id);
			logger.error(e);
			description = await fetch(proposal.descriptionUrl).then(res =>
				res.text(),
			);
		}

		return {
			...proposal,
			description,
			transactions: [],
		};
	}
}

export const proposalLoader = new ProposalLoader();
