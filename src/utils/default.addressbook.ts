import { AddressBook } from '../hooks/useAddressBook.js';
import { Celo } from './chains.js';

export const addressbook: AddressBook = {
	[Celo.id]: {
		'0x471EcE3750Da237f93B8E339c536989b8978a438': [
			{
				label: 'Celo',
				prefered: true,
			},
		],
		'0x765DE816845861e75A25fCA122bb6898B8B1282a': [
			{
				label: 'cUSD',
				prefered: true,
			},
		],
		'0x0000000000000000000000000000000000000000': [
			{
				label: 'Zero',
				prefered: true,
			},
		],
	},
};
