import React from 'react';
import { proposalService } from '../services/proposals.js';
import { useFocusManager } from 'ink';

import { useStdoutDimensions } from '../hooks/useStdoutDimensions.js';
import { useInput } from '../hooks/useInput.js';
import { Metadata } from './Metadata.js';
import { Description } from './Description.js';
import { Transactions } from './Transactions.js';
import { logger } from '../utils/logger.js';

export const Proposal = ({ id }: { id: number }) => {
	const proposal = proposalService.load(id)!;

	const { focus } = useFocusManager();
	const [_, height] = useStdoutDimensions();
	const [heights, setHeights] = React.useState([
		Math.floor((height - 3) / 3),
		Math.floor((height - 3) / 3),
		height - 3 - 2 * Math.floor((height - 3) / 3),
	]);

	const small = height - 13 < 10 ? 1 : 5;
	const featured = height - 2 * small - 3;

	useInput(input => {
		if (input.raw === '1') {
			focus('1');
			setHeights([featured, small, small]);
		}

		if (input.raw === '2') {
			focus('2');
			setHeights([small, featured, small]);
		}

		if (input.raw === '3') {
			focus('3');
			setHeights([small, small, featured]);
		}
	});

	logger.info(height);
	logger.info(heights);

	return (
		<>
			<Metadata proposal={proposal} height={heights[0]} />
			<Description proposal={proposal} height={heights[1]} />
			<Transactions proposal={proposal} height={heights[2]} />
		</>
	);
};
