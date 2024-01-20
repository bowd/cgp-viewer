import React from 'react';
import { Proposal } from '../services/proposals.js';
import { Text, Box, Newline } from 'ink';
import { useStdoutDimensions } from '../hooks/useStdoutDimensions.js';

export const Metadata = ({
	proposal,
	height,
}: {
	proposal: Proposal;
	height: number;
}) => {
	const [width] = useStdoutDimensions();
	const title = 'Metadata [1]';

	return (
		<Box borderStyle="round" width={width} height={height}>
			<Box marginLeft={1} marginTop={-1} width={title.length}>
				<Text bold>{title}</Text>
			</Box>
			<Box marginLeft={-1 * title.length}>
				<Text>
					<Text>ID: {proposal.id}</Text>
					<Newline />
					<Text>Proposer: {proposal.proposer}</Text>
					<Newline />
					<Text>Description URL: {proposal.descriptionUrl}</Text>
				</Text>
			</Box>
		</Box>
	);
};
