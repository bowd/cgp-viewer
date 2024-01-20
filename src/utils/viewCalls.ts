import { Address } from 'viem';
import { RegistryABI } from '../abis/Registry.js';
import { GovernanceABI } from '../abis/Governance.js';

const REGISTRY: Address = '0x000000000000000000000000000000000000ce10';

export const getAddress = (label: string) =>
({
	address: REGISTRY,
	abi: RegistryABI,
	functionName: 'getAddressForStringOrDie',
	args: [label],
} as const);

export const forGovernance = (governance: Address) =>
({
	getProposal: (id: number | bigint) =>
	({
		address: governance,
		abi: GovernanceABI,
		functionName: 'getProposal',
		args: [BigInt(id)],
	} as const),
	getUpvotes: (id: number | bigint) =>
	({
		address: governance,
		abi: GovernanceABI,
		functionName: 'getUpvotes',
		args: [BigInt(id)],
	} as const),
	getQueueLength: () =>
	({
		address: governance,
		abi: GovernanceABI,
		functionName: 'getQueueLength',
		args: [],
	} as const),
	getVotes: (id: number | bigint) =>
	({
		address: governance,
		abi: GovernanceABI,
		functionName: 'getVoteTotals',
		args: [BigInt(id)],
	} as const),
	getStage: (id: number | bigint) =>
	({
		address: governance,
		abi: GovernanceABI,
		functionName: 'getProposalStage',
		args: [BigInt(id)],
	} as const),
	isPassing: (id: number | bigint) =>
	({
		address: governance,
		abi: GovernanceABI,
		functionName: 'isProposalPassing',
		args: [BigInt(id)],
	} as const),
	isApproved: (id: number | bigint) =>
	({
		address: governance,
		abi: GovernanceABI,
		functionName: 'isApproved',
		args: [BigInt(id)],
	} as const),
	getTransaction: (id: number | bigint, index: number | bigint) =>
	({
		address: governance,
		abi: GovernanceABI,
		functionName: 'getProposalTransaction',
		args: [BigInt(id), BigInt(index)],
	} as const),
} as const);
