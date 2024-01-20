import React, { Suspense, useEffect } from 'react';
import { IProposal } from '../services/proposals.js';
import { Text, Box, useFocus, useInput } from 'ink';
import { Transaction } from './Transaction.js';
import { transactionsService } from '../services/transactions.js';
import Spinner from 'ink-spinner';
import { useAddressBook } from '../hooks/useAddressBook.js';
import { Pane } from './Pane.js';

const TransactionsList = ({ proposal }: { proposal: IProposal }) => {
	const transactions = transactionsService.parse(proposal);
	const { addBatch } = useAddressBook();
	useEffect(() => {
		addBatch(
			Array.from(transactionsService.contractNames).map(([address, label]) => ({
				address,
				label,
			})),
		);
	}, [transactionsService.contractNames, addBatch]);

	const [offset, setOffset] = React.useState(0);
	const { isFocused } = useFocus({ id: '3' });
	const [selected, setSelected] = React.useState(0);

	useInput(
		input => {
			if (input === 'j') {
				setSelected(Math.min(selected + 1, transactions.length - 1));
			} else if (input === 'k') {
				setSelected(Math.max(selected - 1, 0));
			}
		},
		{ isActive: isFocused },
	);

	useInput(
		input => {
			if (input === 'j') {
				setOffset(Math.min(offset + 1, transactions.length - 1));
			} else if (input === 'k') {
				setOffset(Math.max(offset - 1, 0));
			}
		},
		{ isActive: isFocused },
	);

	return (
		<Box flexDirection="row" flexGrow={1}>
			<Box flexDirection="column" flexGrow={1} width="100%">
				{transactions.slice(offset).map(tx => (
					<Transaction
						key={`${tx.index}-${tx.raw.to}-${tx.raw.data}`}
						index={tx.index}
						transaction={tx}
						selected={selected == tx.index && isFocused}
					/>
				))}
			</Box>
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
	return (
		<Pane title="Transactions" focusId="3" height={height}>
			<Suspense fallback={<Loading />}>
				<TransactionsList proposal={proposal} />
			</Suspense>
		</Pane>
	);
};
