import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

import { JsonMap, parse, stringify } from '@iarna/toml';
import { useState, useCallback, useMemo, useEffect, useContext } from 'react';
import { useChainId } from 'wagmi';
import { Address } from 'viem';
import { addressbook as defaultAddressbook } from '../utils/default.addressbook.js';
import { logger } from '../utils/logger.js';
import { AddressBookContext } from './AddressBookProvider.js';

const home = os.homedir();
const confDir = path.join(home, '.config/cgp-viewer');
fs.mkdirSync(confDir, { recursive: true });
const addressbookPath = path.join(confDir, 'addressbook.toml');

export interface Alias {
	label: string;
	prefered: boolean;
}

export type AddressBook = Record<number, Record<Address, Alias[]>>;

let _initialAddressBook: AddressBook | null = null;

const loadInitialAddressBook = () => {
	if (_initialAddressBook) return _initialAddressBook;
	if (!fs.existsSync(addressbookPath)) {
		fs.writeFileSync(
			addressbookPath,
			stringify(defaultAddressbook as unknown as JsonMap),
		);
		_initialAddressBook = defaultAddressbook;
	} else {
		_initialAddressBook = parse(
			fs.readFileSync(addressbookPath, 'utf-8'),
		) as unknown as AddressBook;
	}

	return _initialAddressBook;
};

export const makeAddressBookContext = () => {
	const [addressBook, setAddressBook] = useState<AddressBook>(
		loadInitialAddressBook(),
	);
	const chainId = useChainId();

	const [newAddresses, setNewAddresses] = useState<Address[]>([]);

	useEffect(() => {
		fs.writeFileSync(
			addressbookPath,
			stringify(addressBook as unknown as JsonMap),
		);
	}, [addressBook]);

	const add = useCallback(
		(address: Address, label: string) => {
			const aliases = addressBook[chainId]?.[address] ?? [];
			if (aliases.find(alias => alias.label === label)) return;

			setAddressBook((addressBook: AddressBook) => ({
				...addressBook,
				[chainId]: {
					...addressBook[chainId],
					[address]: [
						...aliases,
						{
							label,
							prefered: false,
						},
					],
				},
			}));
		},
		[setAddressBook, chainId],
	);

	const addBatch = useCallback(
		(batch: Array<{ address: Address; label: string }>) => {
			logger.info(batch);
			setAddressBook(addressBook => {
				const newAddressBook = { ...addressBook };
				for (const { address, label } of batch) {
					const aliases = newAddressBook[chainId]?.[address] ?? [];
					if (aliases.find(alias => alias.label === label)) continue;

					newAddressBook[chainId] = {
						...newAddressBook[chainId],
						[address]: [
							...aliases,
							{
								label,
								prefered: false,
							},
						],
					};
				}

				return newAddressBook;
			});
		},
		[setAddressBook, chainId],
	);

	logger.info('newAddresses:', newAddresses);

	return {
		addressBook,
		add,
		addBatch,
		newAddresses,
		setNewAddresses,
	};
};

export const useAddressBook = (): ReturnType<typeof makeAddressBookContext> => {
	return useContext(AddressBookContext)!;
};

export const useAddressBookLabel = (address: Address): string | null => {
	const { addressBook, setNewAddresses } = useAddressBook();
	const chainId = useChainId();
	const aliases = useMemo(
		() => addressBook[chainId]?.[address] ?? [],
		[addressBook, address, chainId],
	);

	useEffect(() => {
		if (aliases.length === 0) {
			logger.info(address);
			setNewAddresses(addresses => {
				if (addresses.indexOf(address) > -1) return addresses;
				return [...addresses, address];
			});
		}
	}, [address, aliases, setNewAddresses]);

	if (aliases.length === 0) {
		return null;
	}
	const prefered = aliases.find(alias => alias.prefered);
	if (prefered) return prefered.label;
	return aliases[0].label;
};
