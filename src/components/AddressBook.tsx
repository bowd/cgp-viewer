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

const Entry = ({ identifier, aliases, selected }: EntryProps) => {
	const { rename, add } = useAddressBook();
	const { focus } = useFocusManager();
	const { isFocused: isAddressBookFocused } = useFocus({ id: '4' });
	const { isFocused: isFormFocused } = useFocus({
		id: `addressbook.entry.${identifier}`,
	});
	const [formActive, setFormActive] = React.useState(false);

	const hasAlias = useMemo(() => aliases.length > 0, [aliases]);
	const display = useMemo(
		() =>
			identifier.length > 42 ? identifier.slice(0, 39) + '...' : identifier,
		[identifier],
	);

	const alias = useMemo(
		() => aliases.find(alias => alias.prefered) || aliases[0],
		[aliases],
	);

	useInput(
		(input, key) => {
			if (key.return || input === 'e') {
				focus(`addressbook.entry.${identifier}`);
				setFormActive(true);
			}
		},
		{ isActive: isAddressBookFocused && selected },
	);

	useInput(
		(_, key) => {
			if (key.escape) {
				focus('4');
			}
		},
		{ isActive: isFormFocused },
	);

	const onSubmit = useCallback(
		(label: string) => {
			if (alias && label !== alias.label) {
				rename(identifier, alias.label, label);
			} else if (!alias) {
				add(identifier, label);
			}
			focus('4');
		},
		[rename, alias, add, hasAlias],
	);

	return (
		<Box key={identifier} flexDirection="column">
			<Text bold color={selected ? 'blue' : 'white'} inverse={selected}>
				{' '}
				{display}{' '}
			</Text>
			{isFormFocused ? (
				<Box flexDirection="row">
					<Text color="yellow">{'  '}label: </Text>
					<UncontrolledTextInput
						onSubmit={onSubmit}
						initialValue={alias ? alias.label : undefined}
					/>
				</Box>
			) : (
				<Text>
					{'  └ '}
					{hasAlias ? (
						<Text color="green">{alias.label}</Text>
					) : (
						<Text color="grey">unknown identifier</Text>
					)}
				</Text>
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
