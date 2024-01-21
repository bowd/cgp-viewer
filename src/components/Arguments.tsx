import React from 'react';
import { Newline, Text } from 'ink';
import { transactionsService } from '../services/transactions.js';
import { AbiParameter, Address } from 'viem';
import { useAddressBook, useAddressBookLabel } from '../hooks/useAddressBook.js';

export const ArgAddress = ({ address }: { address: Address }) => {
	const { highlightedAddress } = useAddressBook();
	const label = useAddressBookLabel(address);

	if (label) {
		return (
			<>
				<Text bold color="green">
					{label}
				</Text>
				{highlightedAddress === address ? (
					<Text color="grey">
						(
						<Text bold color="black" backgroundColor="blue">
							{address}
						</Text>
						)
					</Text>
				) : (
					<Text color="grey">({address})</Text>
				)}
			</>
		);
	} else {
		if (highlightedAddress === address) {
			return (
				<Text bold color="black" backgroundColor="blue">
					{address}
				</Text>
			);
		}
		return <Text color="white">{address}</Text>;
	}
};

export const ArgNumber = ({ number }: { number: bigint }) => {
	const scale = BigInt(10) ** BigInt(12);
	if (number > scale) {
		const scaled = Number(number / scale) / 1e6;
		return (
			<>
				<Text color="yellow" bold>
					{scaled} * 1e18
				</Text>{' '}
				<Text color="grey">{number.toString()}</Text>
			</>
		);
	} else {
		return <Text>{number.toString()}</Text>;
	}
};

const isArray = (type: string) => {
	return type.indexOf('[]') > -1;
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
}: {
	value: unknown;
	abi: AbiParameter;
	nesting: number;
}) => {
	if (abi.type === 'address') {
		return <ArgAddress address={value as Address} />;
	} else if (isNumericType(abi.type)) {
		return <ArgNumber number={value as bigint} />;
	} else if (isArray(abi.type)) {
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
								type: abi.type.replace('[]', ''),
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
						<Text color="grey">{abi.type} </Text>
						<Text color="yellow" bold>
							{abi.name}
						</Text>
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
