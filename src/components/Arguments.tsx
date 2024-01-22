import React from 'react';
import { Newline, Text } from 'ink';
import { transactionsService } from '../services/transactions.js';
import { AbiParameter, Address, Hex } from 'viem';
import { useAddressBook, useAddressBookLabel } from '../hooks/useAddressBook.js';
import { logger } from '../utils/logger.js';

export const ArgHex = ({ value, summary }: { value: Hex; summary?: boolean }) => {
	const { highlightedIdentifier } = useAddressBook();
	const label = useAddressBookLabel(value);

	if (label) {
		if (summary) {
			return <Text>{label}</Text>;
		}

		return (
			<>
				<Text bold color="green">
					{label}
				</Text>
				{highlightedIdentifier === value ? (
					<Text color="grey">
						(
						<Text bold color="black" backgroundColor="blue">
							{value}
						</Text>
						)
					</Text>
				) : (
					<Text color="grey">({value})</Text>
				)}
			</>
		);
	} else {
		if (summary) {
			return <Text>{value.slice(0, 10)}...</Text>;
		}
		if (highlightedIdentifier === value) {
			return (
				<Text bold color="black" backgroundColor="blue">
					{value}
				</Text>
			);
		}
		return <Text color="white">{value}</Text>;
	}
};

export const ArgNumber = ({
	value,
	summary,
}: {
	value: bigint;
	summary?: boolean;
}) => {
	const scale18 = BigInt(10) ** BigInt(12);
	const scaled18 = Number(BigInt(value) / scale18) / 1e6;

	const scale24 = BigInt(10) ** BigInt(18);
	const scaled24 = Number(BigInt(value) / scale24) / 1e6;

	if (summary) {
		if (value > scale18) {
			return <Text>{scaled18} * 1e18</Text>;
		} else {
			return value.toString();
		}
	}

	return (
		<>
			{value > scale18 ? (
				<Text>
					<Text color="cyanBright" bold>
						{scaled18} * 1e18{' '}
					</Text>
					|{' '}
				</Text>
			) : null}
			{value > scale24 ? (
				<Text>
					<Text color="magenta" bold>
						{scaled24} * 1e24{' '}
					</Text>
					|{' '}
				</Text>
			) : null}
			<Text
				color={
					value < scale18 ? (value == BigInt(0) ? 'red' : 'white') : 'grey'
				}
			>
				{value.toString()}
			</Text>
		</>
	);
};

export const ArgArray = ({
	value,
	abi,
	nesting,
}: {
	value: unknown[];
	abi: AbiParameter;
	nesting: number;
}) => {
	return (
		<>
			<Text>[</Text>
			<Newline />
			{((value as unknown[]) || []).map((subvalue, index) => (
				<>
					<Argument
						index={index}
						key={index}
						value={subvalue}
						abi={{
							...abi,
							type: abi.type.replace(ArrayReg, ''),
							name: `[${index}]`,
						}}
						nesting={nesting + 1}
					/>
					<Newline />
				</>
			))}
			<Text>{new Array(nesting).fill('  ').join('')}]</Text>
		</>
	);
};

const tupleGet = (
	value: unknown[] | Record<string, unknown>,
	name: string,
	index: number,
) => {
	if (Array.isArray(value)) {
		return value[index];
	} else {
		return value[name];
	}
};

export const ArgTuple = ({
	value,
	abi,
	nesting,
}: {
	value: unknown[] | Record<string, unknown>;
	abi: AbiParameter & { components: AbiParameter[] };
	nesting: number;
}) => {
	return (
		<>
			<Text>[</Text>
			<Newline />
			{abi.components.map((subAbi, index) => (
				<>
					<Argument
						index={index}
						key={index}
						value={tupleGet(value, subAbi.name!, index)}
						abi={subAbi}
						nesting={nesting + 1}
					/>
					<Newline />
				</>
			))}
			<Text>{new Array(nesting).fill('  ').join('')}]</Text>
		</>
	);
};

const ArrayReg = /\[\d*\]$/;
const isArray = (type: string) => {
	return ArrayReg.exec(type) !== null;
};

const isNumericType = (type: string) => {
	return (
		!isArray(type) && (type.indexOf('uint') === 0 || type.indexOf('int') === 0)
	);
};

export const ArgumentValue = ({
	value,
	abi,
	nesting,
	summary,
}: {
	value: unknown;
	abi: AbiParameter;
	nesting: number;
	summary?: boolean;
}) => {
	if (abi.type === 'address') {
		return <ArgHex value={value as Address} summary={summary} />;
	} else if (isNumericType(abi.type)) {
		return <ArgNumber value={value as bigint} summary={summary} />;
	} else if (abi.type === 'bytes32') {
		return <ArgHex value={value as Hex} summary={summary} />;
	} else if (abi.type === 'string') {
		return <Text>{value as string}</Text>;
	} else if (isArray(abi.type)) {
		if (summary) {
			return <Text>[...]</Text>;
		}
		return <ArgArray value={value as unknown[]} abi={abi} nesting={nesting} />;
	} else if (abi.type === 'tuple') {
		if (summary) {
			return <Text>(...)</Text>;
		}
		return (
			<ArgTuple
				value={value as unknown[]}
				abi={abi as AbiParameter & { components: AbiParameter[] }}
				nesting={nesting}
			/>
		);
	} else if (abi.type === 'bool') {
		return <Text>{value ? 'true' : 'false'}</Text>;
	}

	return <Text>TODO: parse {abi.type}</Text>;
};

const abiType = (abi: AbiParameter) => {
	if (abi.type === 'tuple') {
		if (abi.internalType) {
			return abi.internalType.replace('struct ', '');
		}
	}
	return abi.type;
};

export const Argument = ({
	value,
	abi,
	nesting,
	summary,
}: {
	value: unknown;
	index: number;
	abi: AbiParameter;
	nesting: number;
	summary?: boolean;
}) => {
	if (summary) {
		return <ArgumentValue value={value} abi={abi} nesting={nesting} summary />;
	}
	return (
		<>
			<Text>
				{new Array(nesting).fill('  ').join('')}
				{abi.name ? (
					<>
						<Text color="grey">{abiType(abi)} </Text>
						<Text color="yellow" bold>
							{abi.name}
						</Text>
					</>
				) : (
					<Text>{abiType(abi)}</Text>
				)}{' '}
				={' '}
			</Text>
			<ArgumentValue value={value} abi={abi} nesting={nesting} />
		</>
	);
};
