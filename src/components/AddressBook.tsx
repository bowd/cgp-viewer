import React, { useCallback, useEffect, useMemo } from 'react';
import { Text, Box, useFocus, useInput } from 'ink';
import { Alias, useAddressBook } from '../hooks/useAddressBook.js';
import { useChainId } from 'wagmi';
import { Address } from 'viem';
import { Pane } from './Pane.js';
import { UncontrolledTextInput } from 'ink-text-input';
import { logger } from '../utils/logger.js';

type EntryProps = {
	address: Address;
	aliases: Alias[];
	selected: boolean;
};

const AliasList = ({
	aliases,
	address,
	selected,
}: {
	aliases: Alias[];
	address: Address;
	selected: boolean;
}) => {
	const [formActive, setFormActive] = React.useState(false);
	const { rename } = useAddressBook();
	const main = useMemo(
		() => aliases.find(alias => alias.prefered) || aliases[0],
		[aliases],
	);

	const onSubmit = useCallback(
		(label: string) => {
			if (label === main.label) {
				setFormActive(false);
				return;
			}
			rename(address, main.label, label);
			setFormActive(false);
		},
		[rename, main],
	);

	useInput(
		(_, key) => {
			if (key.return) {
				setFormActive(true);
			}
		},
		{
			isActive: selected && !formActive,
		},
	);

	if (formActive) {
		return (
			<>
				<Box flexDirection="row">
					<Text color="grey">{'   '}label: </Text>
					<UncontrolledTextInput
						initialValue={main.label}
						onSubmit={onSubmit}
					/>
				</Box>
			</>
		);
	}

	return (
		<>
			{aliases.map(alias => (
				<>
					<Text key={alias.label}>
						{'   '}
						<Text color="green">{alias.label}</Text>
						{alias.prefered ? ' (prefered)' : ''}
					</Text>
				</>
			))}
		</>
	);
};

const AliasForm = ({
	address,
	selected,
}: {
	address: Address;
	selected: boolean;
}) => {
	const [formActive, setFormActive] = React.useState(false);
	const { add } = useAddressBook();
	const onSubmit = useCallback(
		(label: string) => {
			if (label === '') {
				setFormActive(false);
				return;
			}
			add(address, label);
		},
		[add],
	);

	useInput(
		(_, key) => {
			if (key.return && !formActive) {
				setFormActive(true);
			}
		},
		{
			isActive: selected,
		},
	);

	if (formActive) {
		return (
			<>
				<Box flexDirection="row">
					<Text>{'   '}label: </Text>
					<UncontrolledTextInput onSubmit={onSubmit} />
				</Box>
			</>
		);
	}

	return <Text color="grey">{'   '}unknown address</Text>;
};

const Entry = ({ address, aliases, selected }: EntryProps) => {
	const hasAlias = aliases.length > 0;

	return (
		<Box key={address} flexDirection="column">
			<Text bold inverse={selected}>
				{' '}
				{address}{' '}
			</Text>
			{hasAlias ? (
				<AliasList address={address} aliases={aliases} selected={selected} />
			) : (
				<AliasForm address={address} selected={selected} />
			)}
		</Box>
	);
};

export const AddressBook = () => {
	const { isFocused } = useFocus({ id: '4' });
	const chainId = useChainId();
	const { addressBook, addressesInProposal, setHighlightedAddress } =
		useAddressBook();
	const [selected, setSelected] = React.useState(0);

	const aliases = useMemo(() => {
		return (address: Address) => {
			return addressBook[chainId][address] || [];
		};
	}, [addressBook, chainId]);

	useEffect(() => {
		if (!isFocused) {
			setHighlightedAddress(null);
			return;
		}
		if (selected >= 0 && selected < addressesInProposal.length) {
			const address = addressesInProposal[selected];
			setHighlightedAddress(address);
		} else {
			setHighlightedAddress(null);
		}
	}, [selected, setHighlightedAddress, addressesInProposal, isFocused]);

	useInput(
		(input, key) => {
			if (input === 'j') {
				setSelected(selected =>
					Math.min(selected + 1, addressesInProposal.length - 1),
				);
			} else if (input === 'k') {
				setSelected(selected => Math.max(selected - 1, 0));
			} else if (key.escape) {
				setSelected(-1);
			}
		},
		{ isActive: isFocused },
	);

	return (
		<Pane title="Address Book" focusId="4">
			<Box flexGrow={1} paddingLeft={0} overflow="hidden">
				<Box flexDirection="column">
					{addressesInProposal.map((address, index) => (
						<Entry
							key={address}
							address={address}
							aliases={aliases(address)}
							selected={selected == index && isFocused}
						/>
					))}
				</Box>
			</Box>
		</Pane>
	);
};
