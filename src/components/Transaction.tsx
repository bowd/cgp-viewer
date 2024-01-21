import React from 'react';
import { Text, Box, Newline } from 'ink';
import { IParsedTransaction } from '../services/transactions.js';
import { ArgHex, ArgNumber, Argument } from './Arguments.js';
import { useAddressBookLabel } from '../hooks/useAddressBook.js';

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

const Summary = ({ transaction }: { transaction: IParsedTransaction }) => {
	if (transaction.parsed === true) {
		return <ParsedSummary transaction={transaction} />;
	} else {
		return <RawSummary transaction={transaction} />;
	}
};

const ParsedSummary = ({
	transaction: tx,
}: {
	transaction: IParsedTransaction & { parsed: true };
}) => {
	const label = useAddressBookLabel(tx.to.address);
	return (
		<Text>
			<Text color="whiteBright">{label || tx.to.address}</Text>.
			<Text color="magenta">{tx.functionName}</Text>
			{tx.value > BigInt(0) ? (
				<Text>
					{'{value: '}
					<ArgNumber value={tx.value} summary />
				</Text>
			) : null}
			{'('}
			{tx.args.map((arg, index) => (
				<>
					<Argument
						key={index}
						value={arg}
						index={index}
						abi={tx.abi.inputs[index]}
						nesting={1}
						summary
					/>
					{index < tx.abi.inputs.length - 1 ? ', ' : ''}
				</>
			))}
			{')'}
		</Text>
	);
};

const RawSummary = ({
	transaction: tx,
}: {
	transaction: IParsedTransaction & { parsed: false };
}) => {
	const label = useAddressBookLabel(tx.raw.to);
	const signature = tx.raw.data.slice(0, 10);
	const data = tx.raw.data.slice(10);
	return (
		<Text>
			{label || tx.raw.to}.{signature}
			{tx.raw.value > BigInt(0) ? (
				<Text>
					{'{value: '}
					<ArgNumber value={tx.raw.value} summary />
				</Text>
			) : null}
			{'('}
			<ArgHex value={`0x${data}`} summary />
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
				{!selected ? (
					<Text color="white">
						{' '}
						<Summary transaction={transaction} />
					</Text>
				) : null}
			</Box>
			{selected ? (
				<Box marginTop={1}>
					{transaction.parsed === true ? (
						<ParsedTransaction transaction={transaction} />
					) : (
						<RawTransaction transaction={transaction} />
					)}
				</Box>
			) : null}
		</Box>
	);
};
