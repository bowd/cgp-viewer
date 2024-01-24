import React, { useEffect, useMemo } from 'react';
import { proposalService } from '../services/proposals.js';
import { Box, useFocus, useFocusManager, useInput } from 'ink';

import { useStdoutDimensions } from '../hooks/useStdoutDimensions.js';
import { Metadata } from './Metadata.js';
import { Description } from './Description.js';
import { Transactions } from './Transactions.js';
import { logger } from '../utils/logger.js';
import { AddressBook } from './AddressBook.js';

const STATUS_HEIGHT = 3;
const METADATA_HEIGHT = 5;

export const Proposal = ({ id }: { id: number }) => {
	const proposal = proposalService.load(id)!;
	const { isFocused: isMetadataFocused } = useFocus({ id: '1' });
	const { isFocused: isDescriptionFocused } = useFocus({ id: '2' });
	const { isFocused: isTransactionsFocused } = useFocus({ id: '3' });
	const { isFocused: isAddressBookFocused } = useFocus({ id: '4' });
	const { focus } = useFocusManager();

	const [zoomed, setZoomed] = React.useState<string | null>(null);
	const [width, height] = useStdoutDimensions();
	const [descriptionHeight, transactionsHeight] = useMemo(() => {
		let transactionsHeight, descriptionHeight;
		if (zoomed === 'description') {
			transactionsHeight = 1;
			descriptionHeight = height - STATUS_HEIGHT - METADATA_HEIGHT - 2;
		} else if (zoomed === 'transactions') {
			descriptionHeight = 1;
			transactionsHeight = height - STATUS_HEIGHT - METADATA_HEIGHT - 2;
		} else {
			const half = Math.floor((height - (STATUS_HEIGHT + METADATA_HEIGHT)) / 2);
			descriptionHeight = half;
			transactionsHeight =
				height - (STATUS_HEIGHT + METADATA_HEIGHT + descriptionHeight);
		}
		return [descriptionHeight, transactionsHeight];
	}, [zoomed, height]);

	useEffect(() => {
		focus('1');
	}, [id]);

	useInput(
		input => {
			switch (input) {
				case '1':
					focus('1');
					return;
				case '2':
					if (zoomed === 'transactions') {
						setZoomed(null);
					}
					focus('2');
					return;
				case '3':
					if (zoomed === 'description') {
						setZoomed(null);
					}
					focus('3');
					return;
				case '4':
					focus('4');
					return;
				case 'z':
					if (isDescriptionFocused) {
						setZoomed(z => (z === 'description' ? null : 'description'));
					} else if (isTransactionsFocused) {
						setZoomed(z => (z === 'transactions' ? null : 'transactions'));
					}
					return;
			}
		},
		{
			isActive:
				isMetadataFocused ||
				isDescriptionFocused ||
				isTransactionsFocused ||
				isAddressBookFocused,
		},
	);

	const addressBookWidth = 46;

	return (
		<Box flexDirection="row">
			<Box width={width - addressBookWidth} flexDirection="column">
				<Metadata proposal={proposal} height={METADATA_HEIGHT} />
				<Description proposal={proposal} height={descriptionHeight} />
				<Transactions
					proposal={proposal}
					height={transactionsHeight}
					width={width - addressBookWidth}
				/>
			</Box>
			<AddressBook height={height - STATUS_HEIGHT} width={addressBookWidth} />
		</Box>
	);
};
