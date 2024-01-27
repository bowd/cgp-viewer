import React, { createContext, useContext } from 'react';
import { makeAddressBookContext } from '../hooks/useAddressBook.js';

export const AddressBookContext = createContext<ReturnType<
	typeof makeAddressBookContext
> | null>(null);

export function AddressBookProvider({ children }: any) {
	const addressBook = makeAddressBookContext();
	return (
		<AddressBookContext.Provider value={addressBook}>
			{children}
		</AddressBookContext.Provider>
	);
}
