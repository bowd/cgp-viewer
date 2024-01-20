import React, { useMemo } from 'react';
import { IProposal } from '../services/proposals.js';
import { Text, Box, Newline, useFocus, useInput } from 'ink';
import { useAddressBook } from '../hooks/useAddressBook.js';
import { useChainId } from 'wagmi';
import { Address } from 'viem';
import { logger } from '../utils/logger.js';

export const AddressBook = () => {
	const title = 'Address Book [4]';
	const { isFocused } = useFocus({ id: '4' });
	const chainId = useChainId();
	const { addressBook, newAddresses } = useAddressBook();
	const [selected, setSelected] = React.useState(0);

	const addresses = useMemo(() => {
		const entries = addressBook[chainId];
		return [...newAddresses, ...(Object.keys(entries) as Address[])];
	}, [addressBook, chainId, newAddresses]);

	useInput(
		input => {
			if (input === 'j') {
				setSelected(Math.min(selected + 1, addresses.length - 1));
			} else if (input === 'k') {
				setSelected(Math.max(selected - 1, 0));
			}
		},
		{ isActive: isFocused },
	);

	return (
		<Box
			borderStyle="round"
			borderColor={isFocused ? 'white' : 'grey'}
			width="100%"
		>
			<Box marginLeft={1} marginTop={-1} width={title.length}>
				<Text bold>{title}</Text>
			</Box>
			<Box marginLeft={-1 * title.length - 1} flexDirection="column">
				<Box flexGrow={1} paddingLeft={0} overflow="hidden">
					<Box flexDirection="column">
						{addresses.map((address, index) => (
							<Text key={address}>
								<Text bold inverse={isFocused && selected == index}>
									{' '}
									{address}{' '}
								</Text>
								{newAddresses.indexOf(address) > -1 ? (
									<>
										<Newline />
										<Text color="grey">{'   '}unknown address</Text>
									</>
								) : (
									(addressBook[chainId][address] || []).map(alias => (
										<>
											<Newline />
											<Text key={alias.label}>
												{'   '}
												<Text color="green">{alias.label}</Text>
												{alias.prefered ? ' (prefered)' : ''}
											</Text>
										</>
									))
								)}
							</Text>
						))}
					</Box>
				</Box>
				<Box flexGrow={0} height={2} flexDirection="column">
					<Text color="grey">{new Array(48).fill('─').join('')}</Text>
					<Box paddingLeft={1}>
						<Text>
							<Text bold>[a]</Text>dd new entry
						</Text>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};
