import React from 'react';
import { Proposal } from '../services/proposals.js';
import { Text, Box } from 'ink';
import { useStdoutDimensions } from '../hooks/useStdoutDimensions.js';

export const Transactions = ({
	proposal,
	height,
}: {
	proposal: Proposal;
	height: number;
}) => {
	const title = 'Transactions [3]';
	const [width] = useStdoutDimensions();

	return (
		<Box borderStyle="round" width={width} height={height}>
			<Box marginLeft={1} marginTop={-1} width={title.length + 2}>
				<Text bold>{title}</Text>
			</Box>
			<Text>Transactions: {proposal.transactionsLength}</Text>
		</Box>
	);
};
