import React, { createContext, useContext } from 'react';
import { makeAddressBookContext } from './useAddressBook.js';

export const AddressBookContext = createContext<ReturnType<
	typeof makeAddressBookContext
> | null>(null);

export default function AddressBookProvider({ children }: any) {
	const addressBook = makeAddressBookContext();
	return (
		<AddressBookContext.Provider value={addressBook}>
			{children}
		</AddressBookContext.Provider>
	);
}
