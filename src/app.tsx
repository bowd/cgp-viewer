import React, { useEffect, Suspense } from 'react';
import Spinner from 'ink-spinner';
import { Box, Text, useFocusManager, useInput } from 'ink';
import { usePublicClient } from 'wagmi';

import { Proposal } from './components/Proposal.js';
import { StatusBar } from './components/StatusBar.js';
import { Help } from './components/Help.js';

import { proposalService } from './services/proposals.js';
import { useStdoutDimensions } from './hooks/useStdoutDimensions.js';
import { logger } from './utils/logger.js';
import { transactionsService } from './services/transactions.js';

const Loading = () => {
	const [width, height] = useStdoutDimensions();

	return (
		<Box
			width={width}
			height={height - 3}
			alignItems="center"
			paddingLeft={width / 2 - 10}
		>
			<Text bold color="green">
				Loading <Spinner type="dots" />
			</Text>
		</Box>
	);
};

export const App = ({ proposalId }: { proposalId: number }) => {
	const client = usePublicClient();
	const [ready, setReady] = React.useState(false);
	const [showHelp, setShowHelp] = React.useState(false);

	useEffect(() => {
		logger.info('Initializing proposal service');
		Promise.all([
			proposalService.init(client),
			transactionsService.init(client),
		]).then(() => setReady(true));
	}, [client, setReady]);

	useInput((input, key) => {
		if (input === 'h' || input === '?') {
			setShowHelp(true);
		}
		if (input === 'q') {
			process.exit(0);
		}
	});

	if (!ready) {
		return <Loading />;
	}

	return (
		<>
			<Suspense fallback={<Loading />}>
				<Proposal id={proposalId} />
			</Suspense>
			<StatusBar />
		</>
	);
};
