import { Address, PublicClient } from 'viem';
import { SingleLoaderService } from './service.js';
import { getAddress, forGovernance } from '../utils/viewCalls.js';
import { IGovernanceData, throwIfError, toStage } from './types.js';

export class GovernanceService extends SingleLoaderService<IGovernanceData> {
	client: PublicClient | null = null;
	governanceAddress: Address = '0x';
	queries: ReturnType<typeof forGovernance> | null = null;

	async init(client: PublicClient) {
		this.client = client;
		this.governanceAddress = await client.readContract(
			getAddress('Governance'),
		);
		this.queries = forGovernance(this.governanceAddress);
	}

	async handleLoad(): Promise<IGovernanceData> {
		const lists = await this.client!.multicall({
			contracts: [this.queries!.getQueue(), this.queries!.getDequeue()],
		});

		throwIfError(lists);

		const queued = lists[0].result!.map(Number);
		const dequeued = lists[1].result!.map(Number);
		const all = [...queued, ...dequeued];

		const [stage, votes, isApproved] = await Promise.all([
			await this.client!.multicall({
				contracts: all.map(id => this.queries!.getStage(id)),
			}),
			await this.client!.multicall({
				contracts: all.map(id => this.queries!.getVotes(id)),
			}),
			await this.client!.multicall({
				contracts: all.map(id => this.queries!.isApproved(id)),
			}),
		]);

		throwIfError(stage);
		throwIfError(votes);
		throwIfError(isApproved);

		return {
			proposals: all
				.map((id, i) => ({
					id,
					stage: toStage(stage[i].result!),
					votes: {
						votesFor: votes[i].result![0],
						votesAgainst: votes[i].result![1],
						abstains: votes[i].result![2],
					},
					isApproved: isApproved[i].result as boolean,
				}))
				.sort((a, b) => a.id - b.id)
				.reverse()
				.filter(p => p.stage !== 'None'),
		};
	}
}
