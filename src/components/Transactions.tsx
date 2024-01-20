import React, { Suspense } from 'react';
import { IProposal } from '../services/proposals.js';
import { Text, Box, useFocus, useInput } from 'ink';
import { useStdoutDimensions } from '../hooks/useStdoutDimensions.js';
import { Transaction } from './Transaction.js';
import { transactionsService } from '../services/transactions.js';
import Spinner from 'ink-spinner';

const TransactionsList = ({ proposal }: { proposal: IProposal }) => {
	const [width] = useStdoutDimensions();
	const transactions = transactionsService.parse(proposal);
	const [offset, setOffset] = React.useState(0);
	const { isFocused } = useFocus({ id: '3' });

	useInput(
		(input, key) => {
			if (input === 'j') {
				setOffset(Math.min(offset + 1, transactions.length - 1));
			} else if (input === 'k') {
				setOffset(Math.max(offset - 1, 0));
			}
		},
		{ isActive: isFocused },
	);

	return (
		<Box flexDirection="column" flexGrow={1} width={width - 2}>
			{transactions.slice(offset).map(tx => (
				<Transaction
					key={`${tx.index}-${tx.raw.to}-${tx.raw.data}`}
					index={tx.index}
					transaction={tx}
				/>
			))}
		</Box>
	);
};

const Loading = () => {
	return (
		<Text bold color="green">
			Loading <Spinner type="dots" />
		</Text>
	);
};

export const Transactions = ({
	proposal,
	height,
}: {
	proposal: IProposal;
	height: number;
}) => {
	const title = 'Transactions [3]';
	const [width] = useStdoutDimensions();
	const { isFocused } = useFocus({ id: '3' });

	return (
		<Box
			borderStyle="round"
			width={width}
			height={height}
			borderColor={isFocused ? 'white' : 'grey'}
		>
			<Box marginLeft={1} marginTop={-1} width={title.length + 2}>
				<Text bold>{title}</Text>
			</Box>
			<Box marginLeft={-1 * (title.length + 3)} overflow="hidden" padding={0}>
				<Suspense fallback={<Loading />}>
					<TransactionsList proposal={proposal} />
				</Suspense>
			</Box>
		</Box>
	);
};
