import React, { useCallback, useEffect, useMemo } from 'react';
import { Text, Box, useFocus, useInput, useFocusManager } from 'ink';
import { Alias, useAddressBook } from '../hooks/useAddressBook.js';
import { useChainId } from 'wagmi';
import { Hex } from 'viem';
import { Pane } from './Pane.js';
import { UncontrolledTextInput } from 'ink-text-input';

type EntryProps = {
	identifier: Hex;
	aliases: Alias[];
	selected: boolean;
};

const AliasList = ({
	aliases,
	identifier,
	selected,
}: {
	aliases: Alias[];
	identifier: Hex;
	selected: boolean;
}) => {
	useFocus({ id: 'form' });
	const { focus } = useFocusManager();
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
				focus('4');
				return;
			}
			rename(identifier, main.label, label);
			setFormActive(false);
			focus('4');
		},
		[rename, main],
	);

	useInput(
		(input, key) => {
			if (key.return || input === 'e') {
				focus('form');
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
					<Text color="yellow">{'   '}label: </Text>
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
			<Text>
				{'   '}
				<Text color="green">{main.label}</Text>
			</Text>
		</>
	);
};

const AliasForm = ({
	identifier,
	selected,
}: {
	identifier: Hex;
	selected: boolean;
}) => {
	useFocus({ id: 'form' });
	const { focus } = useFocusManager();
	const [formActive, setFormActive] = React.useState(false);
	const { add } = useAddressBook();
	const onSubmit = useCallback(
		(label: string) => {
			if (label === '') {
				setFormActive(false);
				focus('4');
				return;
			}
			add(identifier, label);
			setFormActive(false);
			focus('4');
		},
		[add],
	);

	useInput(
		(input, key) => {
			if (key.return || input === 'e') {
				setFormActive(true);
				focus('form');
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
					<Text color="yellow">{'   '}label: </Text>
					<UncontrolledTextInput onSubmit={onSubmit} />
				</Box>
			</>
		);
	}

	return <Text color="grey">{'   '}unknown identifier</Text>;
};

const Entry = ({ identifier, aliases, selected }: EntryProps) => {
	const hasAlias = aliases.length > 0;
	const display =
		identifier.length > 42 ? identifier.slice(0, 39) + '...' : identifier;

	return (
		<Box key={identifier} flexDirection="column">
			<Text bold color={selected ? 'blue' : 'white'} inverse={selected}>
				{' '}
				{display}{' '}
			</Text>
			{hasAlias ? (
				<AliasList
					identifier={identifier}
					aliases={aliases}
					selected={selected}
				/>
			) : (
				<AliasForm identifier={identifier} selected={selected} />
			)}
		</Box>
	);
};

export const AddressBook = ({
	height,
	width,
}: {
	height: number;
	width: number;
}) => {
	const { isFocused } = useFocus({ id: '4' });
	const chainId = useChainId();
	const { addressBook, identifiersInProposal, setHighlightedIdentifier } =
		useAddressBook();
	const [selected, setSelected] = React.useState(0);

	const aliases = useMemo(() => {
		return (identifier: Hex) => {
			return addressBook[chainId][identifier] || [];
		};
	}, [addressBook, chainId]);

	useEffect(() => {
		if (!isFocused) {
			return;
		}
		if (selected >= 0 && selected < identifiersInProposal.length) {
			const identifier = identifiersInProposal[selected];
			setHighlightedIdentifier(identifier);
		} else {
			setHighlightedIdentifier(null);
		}
	}, [selected, setHighlightedIdentifier, identifiersInProposal, isFocused]);

	useInput(
		(input, key) => {
			if (input === 'j') {
				setSelected(selected =>
					Math.min(selected + 1, identifiersInProposal.length - 1),
				);
			} else if (input === 'k') {
				setSelected(selected => Math.max(selected - 1, 0));
			} else if (key.escape) {
				setSelected(-1);
			}
		},
		{ isActive: isFocused },
	);

	const maxShown = Math.floor((height - 2) / 2);
	const offset = Math.max(selected - maxShown + 1, 0);

	return (
		<Pane title="Address Book" focusId="4" height={height} width={width}>
			<Box overflow="hidden">
				<Box flexDirection="column" width={width}>
					{identifiersInProposal
						.slice(offset, offset + maxShown)
						.map((identifier, index) => (
							<Entry
								key={identifier}
								identifier={identifier}
								aliases={aliases(identifier)}
								selected={selected == index + offset}
							/>
						))}
				</Box>
			</Box>
		</Pane>
	);
};
