import { AbiFunction, Address, Hex, MulticallReturnType } from 'viem';

export enum Stage {
	None = 'None',
	Queued = 'Queued',
	Approval = 'Approval',
	Referendum = 'Referendum',
	Execution = 'Execution',
	Expiration = 'Expiration',
}

export const throwIfError = (responses: MulticallReturnType<any, true>) => {
	const withError = responses.find(r => r.error);
	if (withError) throw withError.error;
};

export const toStage = (stageNumber: number): Stage => {
	return stages[stageNumber];
};

export const stages: Stage[] = [
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

export interface IListProposal {
	id: number;
	stage: Stage;
	votes: {
		votesFor: bigint;
		votesAgainst: bigint;
		abstains: bigint;
	};
	isApproved: boolean;
}

export interface IGovernanceData {
	proposals: IListProposal[];
}

export type IParsedTransaction =
	| {
		parsed: true;
		signature: string;
		index: number;
		raw: ITransaction;
		to: {
			address: Address;
			name: string;
			isProxy: boolean;
			implementation?: Address;
		};
		value: bigint;
		functionName: string;
		abi: AbiFunction;
		args: unknown[];
	}
	| {
		parsed: false;
		index: number;
		raw: ITransaction;
	};
