import React, { useMemo } from 'react';
import { proposalService } from '../services/proposals.js';
import { Box, Text, useFocus, useFocusManager } from 'ink';

import { useStdoutDimensions } from '../hooks/useStdoutDimensions.js';
import { useInput } from '../hooks/useInput.js';
import { Metadata } from './Metadata.js';
import { Description } from './Description.js';
import { Transactions } from './Transactions.js';
import { logger } from '../utils/logger.js';
import { AddressBook } from './AddressBook.js';

const STATUS_HEIGHT = 3;
const METADATA_HEIGHT = 5;

export const Proposal = ({ id }: { id: number }) => {
	const proposal = proposalService.load(id)!;
	const { isFocused: isDescriptionFocused } = useFocus({ id: '2' });
	const { isFocused: isTransactionsFocused } = useFocus({ id: '3' });
	const [zoomed, setZoomed] = React.useState<string | null>(null);

	const { focus } = useFocusManager();
	const [width, height] = useStdoutDimensions();
	const [descriptionHeight, transactionsHeight] = useMemo(() => {
		let transactionsHeight, descriptionHeight;
		if (zoomed === 'description') {
			transactionsHeight = 10;
			descriptionHeight =
				height - (STATUS_HEIGHT + METADATA_HEIGHT + transactionsHeight);
		} else if (zoomed === 'transactions') {
			descriptionHeight = 10;
			transactionsHeight =
				height - (STATUS_HEIGHT + METADATA_HEIGHT + descriptionHeight);
		} else {
			const half = Math.floor((height - (STATUS_HEIGHT + METADATA_HEIGHT)) / 2);
			descriptionHeight = half;
			transactionsHeight =
				height - (STATUS_HEIGHT + METADATA_HEIGHT + descriptionHeight);
		}
		return [descriptionHeight, transactionsHeight];
	}, [zoomed, height]);

	useInput(input => {
		if (input.raw === '1') {
			focus('1');
		}

		if (input.raw === '2') {
			focus('2');
		}

		if (input.raw === '3') {
			focus('3');
		}

		if (input.raw === '4') {
			focus('4');
		}

		if (input.raw === 'z') {
			if (isDescriptionFocused) {
				setZoomed(z => (z === 'description' ? null : 'description'));
			} else if (isTransactionsFocused) {
				setZoomed(z => (z === 'transactions' ? null : 'transactions'));
			}
		}
	});

	const addressBookWidth = 46;

	return (
		<Box flexDirection="row">
			<Box width={width - addressBookWidth} flexDirection="column">
				<Metadata proposal={proposal} height={METADATA_HEIGHT} />
				<Description proposal={proposal} height={descriptionHeight} />
				<Transactions proposal={proposal} height={transactionsHeight} />
			</Box>
			<Box width={addressBookWidth}>
				<AddressBook />
			</Box>
		</Box>
	);
};
