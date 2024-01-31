import React from 'react';
import { IProposal } from '../../services/types.js';
import { Text, Newline, Box } from 'ink';
import { Pane } from '../shared/Pane.js';

const getVotingPercentages = (
	votes: IProposal['votes'],
): { votesFor: number; votesAgainst: number; abstains: number } => {
	const sum = votes.abstains + votes.votesAgainst + votes.votesFor;
	const getPercentage = (value: bigint) =>
		sum === BigInt(0) ? 0 : Number((value * BigInt(10000)) / sum) / 100;
	const votesFor = getPercentage(votes.votesFor);
	const votesAgainst = getPercentage(votes.votesAgainst);
	const abstains = getPercentage(votes.abstains);

	return { votesFor, votesAgainst, abstains };
};

export const Metadata = ({
	proposal,
	height,
}: {
	proposal: IProposal;
	height: number;
}) => {
	const percs = getVotingPercentages(proposal.votes);

	return (
		<Pane title="Metadata" shortcut="1" focusId="metadata" height={height}>
			<Box paddingLeft={1}>
				<Text>
					<Text bold backgroundColor={'yellow'} color="black">
						{' '}
						Proposal {proposal.id}{' '}
					</Text>
					<Text>{' | '}</Text>
					<Text bold inverse>
						{' '}
						{proposal.stage.toString()}{' '}
					</Text>
					<Text>
						<Text>{' | '}</Text>
					</Text>
					<Text>
						Proposer: <Text bold>{proposal.proposer}</Text>
					</Text>
					<Text>
						<Text>{' | '}</Text>
					</Text>
					<Text bold color={proposal.isApproved ? 'green' : 'red'}>
						{proposal.isApproved ? '✔ Approved' : ' Not Approved'}
					</Text>
					<Text>
						<Text>{' | '}</Text>
					</Text>
					<Text bold color={proposal.isPassing ? 'green' : 'red'}>
						{proposal.isPassing ? '✔ Passing' : ' Not Passing'}
					</Text>
					<Newline />
					<Text>
						Description URL: <Text bold>{proposal.descriptionUrl}</Text>
					</Text>
					<Newline />
					<Text>
						<Text backgroundColor="green" color="black">
							{' '}
							For{' '}
						</Text>
						<Text bold>
							{' '}
							{proposal.votes.votesFor.toString()} ({percs.votesFor}%){' '}
						</Text>
						<Text backgroundColor="red" color="black">
							{' '}
							Against{' '}
						</Text>
						<Text bold>
							{' '}
							{proposal.votes.votesAgainst.toString()} ({percs.votesAgainst}%){' '}
						</Text>
						<Text inverse> Abstain </Text>
						<Text bold>
							{' '}
							{proposal.votes.abstains.toString()} ({percs.abstains}%){' '}
						</Text>
					</Text>
				</Text>
			</Box>
		</Pane>
	);
};
