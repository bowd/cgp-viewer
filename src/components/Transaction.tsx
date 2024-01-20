import React from 'react';
import { ITransaction } from '../services/proposals.js';
import { Text, Box, Newline } from 'ink';
import { IParsedTransaction } from '../services/transactions.js';
import { ArgAddress, ArgNumber } from './Arguments.js';
import { AbiParameter, Address } from 'viem';

const isNumericType = (type: string) => {
	return type.indexOf('uint') === 0 || type.indexOf('int') === 0;
};

export const ArgumentValue = ({
	value,
	abi,
	nesting,
}: {
	value: unknown;
	abi: AbiParameter;
	nesting: number;
}) => {
	if (abi.type === 'address') {
		return <ArgAddress address={value as Address} />;
	} else if (isNumericType(abi.type)) {
		return <ArgNumber number={value as bigint} />;
	}

	return <Text>TODO: parse {abi.type}</Text>;
};

export const Argument = ({
	value,
	abi,
	nesting,
}: {
	value: unknown;
	index: number;
	abi: AbiParameter;
	nesting: number;
}) => {
	return (
		<>
			<Text>
				{new Array(nesting).fill('  ').join('')}
				{abi.name ? (
					<>
						<Text color="yellow" bold>
							{abi.name}
						</Text>
						<Text color="grey">({abi.type})</Text>
					</>
				) : (
					<Text>{abi.type}</Text>
				)}{' '}
				={' '}
			</Text>
			<ArgumentValue value={value} abi={abi} nesting={nesting} />
		</>
	);
};

export const ParsedTransaction = ({
	transaction: tx,
}: {
	transaction: IParsedTransaction & { parsed: true };
}) => {
	return (
		<Text>
			<ArgAddress address={tx.to.address} />.
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
}: {
	transaction: IParsedTransaction;
	index: number;
}) => {
	const title = ` ${index} `;
	return (
		<Box
			borderStyle="round"
			width="100%"
			flexShrink={0}
			flexGrow={0}
			borderColor="grey"
			paddingLeft={1}
			paddingRight={1}
		>
			<Box marginLeft={-1} marginTop={-1}>
				<Text color="grey">{title}</Text>
			</Box>
			<Box marginLeft={-1 * title.length + 1}>
				{transaction.parsed === true ? (
					<ParsedTransaction transaction={transaction} />
				) : (
					<RawTransaction transaction={transaction} />
				)}
			</Box>
		</Box>
	);
};
