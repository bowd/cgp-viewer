import React from 'react';
import { Text } from 'ink';
import { transactionsService } from '../services/transactions.js';
import { Address } from 'viem';
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
