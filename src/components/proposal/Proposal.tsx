import React, { useEffect, useMemo } from 'react';
import { Box, useFocus, useFocusManager, useInput } from 'ink';

import { IProposal } from '../../services/types.js';
import { useStdoutDimensions } from '../../hooks/useStdoutDimensions.js';
import { Metadata } from './Metadata.js';
import { Description } from './Description.js';
import { Transactions } from './Transactions.js';
import { logger } from '../../utils/logger.js';
import { AddressBook } from './AddressBook.js';
import { useLoaderData, useParams, useSearchParams } from 'react-router-dom';
import { useServices } from '../../providers/ServiceProvider.js';

const STATUS_HEIGHT = 3;
const METADATA_HEIGHT = 5;

export const Proposal = () => {
	const { id } = useParams();
	const { proposal: proposalService } = useServices();
	const proposal = proposalService.loadSuspense(parseInt(id!));
	const { isFocused: isMetadataFocused } = useFocus({ id: 'metadata' });
	const { isFocused: isDescriptionFocused } = useFocus({ id: 'description' });
	const { isFocused: isTransactionsFocused } = useFocus({ id: 'transactions' });
	const { isFocused: isAddressBookFocused } = useFocus({ id: 'addressbook' });
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
		focus('metadata');
	}, []);

	useInput(
		input => {
			switch (input) {
				case '1':
					focus('metadata');
					return;
				case '2':
					if (zoomed === 'transactions') {
						setZoomed(null);
					}
					focus('description');
					return;
				case '3':
					if (zoomed === 'description') {
						setZoomed(null);
					}
					focus('transactions');
					return;
				case '4':
					focus('addressbook');
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
