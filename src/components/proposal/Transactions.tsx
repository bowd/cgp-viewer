import React, { Suspense, useEffect } from 'react';
import { IProposal } from '../../services/types.js';
import { Text, Box, useFocus, useInput } from 'ink';
import { Transaction } from './Transaction.js';
import Spinner from 'ink-spinner';
import { useAddressBook } from '../../hooks/useAddressBook.js';
import { Pane } from '../shared/Pane.js';
import { useServices } from '../../providers/ServiceProvider.js';
import { logger } from '../../utils/logger.js';

const TransactionsList = ({ proposal }: { proposal: IProposal }) => {
	const { transactions: transactionsService } = useServices();
	const transactions = transactionsService.loadSuspense(proposal.id);

	const { addBatch } = useAddressBook();
	useEffect(() => {
		addBatch(
			Array.from(transactionsService.contractNames).map(
				([identifier, label]) => ({
					identifier,
					label,
				}),
			),
		);
	}, [transactionsService.contractNames, addBatch]);

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

	return (
		<Box flexDirection="row" flexGrow={1}>
			<Box flexDirection="column" flexGrow={1} width="100%">
				{transactions.slice(selected).map(tx => (
					<Transaction
						key={`${tx.index}-${tx.raw.to}-${tx.raw.data}`}
						index={tx.index}
						transaction={tx}
						selected={selected == tx.index}
					/>
				))}
			</Box>
		</Box>
	);
};

export const Transactions = ({
	proposal,
	height,
	width,
}: {
	proposal: IProposal;
	height: number;
	width: number;
}) => {
	useFocus({ id: '2' });
	return (
		<Pane
			title="Transactions"
			shortcut="3"
			focusId="transactions"
			height={height}
		>
			<Box overflow="hidden" height={height - 2}>
				<Suspense
					fallback={
						<Box marginTop={(height - 3) / 2} marginLeft={width / 2 - 10}>
							<Text bold color="green">
								Parsing transactions <Spinner type="dots" />
							</Text>
						</Box>
					}
				>
					<TransactionsList proposal={proposal} />
				</Suspense>
			</Box>
		</Pane>
	);
};
