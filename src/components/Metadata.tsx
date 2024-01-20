import React from 'react';
import { IProposal } from '../services/proposals.js';
import { Text, Box, Newline, useFocus } from 'ink';
import { useStdoutDimensions } from '../hooks/useStdoutDimensions.js';

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
	const [width] = useStdoutDimensions();
	const title = 'Metadata [1]';
	const { isFocused } = useFocus({ id: '1' });
	const percs = getVotingPercentages(proposal.votes);

	return (
		<Box
			borderStyle="round"
			width={width}
			height={height}
			borderColor={isFocused ? 'white' : 'grey'}
		>
			<Box marginLeft={1} marginTop={-1} width={title.length}>
				<Text bold>{title}</Text>
			</Box>
			<Box marginLeft={-1 * title.length}>
				<Text>
					<Text bold backgroundColor={'yellow'} color="black">
						{' '}
						CGP {proposal.id}{' '}
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
		</Box>
	);
};
