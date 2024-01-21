import React from 'react';
import { Text, Box, Newline } from 'ink';
import { IParsedTransaction } from '../services/transactions.js';
import { ArgHex, Argument } from './Arguments.js';

export const ParsedTransaction = ({
	transaction: tx,
}: {
	transaction: IParsedTransaction & { parsed: true };
}) => {
	return (
		<Text>
			<ArgHex value={tx.to.address} />.
			<Text color="yellow">{tx.functionName}</Text>
			<Text color="grey"> {tx.signature} </Text>
			(
			<Newline />
			{tx.args.map((arg, index) => (
				<Text key={`${index}-${tx.abi.inputs[index].name}`}>
					<Argument
						key={index}
						value={arg}
						index={index}
						abi={tx.abi.inputs[index]}
						nesting={1}
					/>
					<Newline />
				</Text>
			))}
			{')'}
		</Text>
	);
};

export const RawTransaction = ({
	transaction,
}: {
	transaction: IParsedTransaction;
}) => {
	return (
		<Text>
			{transaction.raw.to}
			<Newline />
			{transaction.raw.value.toString()}
			<Newline />
			{transaction.raw.data}
		</Text>
	);
};

export const Transaction = ({
	transaction,
	index,
	selected,
}: {
	transaction: IParsedTransaction;
	index: number;
	selected: boolean;
}) => {
	const title = ` ${index} `;
	return (
		<Box
			borderStyle="single"
			borderBottom={false}
			borderLeft={false}
			borderRight={false}
			width="100%"
			flexShrink={0}
			flexGrow={0}
			borderColor={selected ? 'white' : 'grey'}
			paddingLeft={1}
			paddingRight={1}
			flexDirection="column"
			paddingBottom={1}
		>
			<Box marginTop={-1}>
				<Text color={selected ? 'white' : 'grey'} inverse>
					{title}
				</Text>
			</Box>
			<Box marginTop={1}>
				{transaction.parsed === true ? (
					<ParsedTransaction transaction={transaction} />
				) : (
					<RawTransaction transaction={transaction} />
				)}
			</Box>
		</Box>
	);
};
