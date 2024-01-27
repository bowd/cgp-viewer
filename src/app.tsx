import React, { useEffect, Suspense } from 'react';
import {
	RouterProvider,
	createMemoryRouter,
	useRouteError,
} from 'react-router-dom';
import Spinner from 'ink-spinner';
import { Box, Text, useInput } from 'ink';

import { Proposal } from './components/Proposal.js';
import { StatusBar } from './components/StatusBar.js';

import { useStdoutDimensions } from './hooks/useStdoutDimensions.js';
import { logger } from './utils/logger.js';
import { useServices } from './providers/ServiceProvider.js';

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

const Error = () => {
	const error = useRouteError() as Error;
	logger.error(error);
	return <Text color="red">{error.message}</Text>;
};

export const App = ({ id }: { id: number }) => {
	// useKeyNavShortcut({
	// 	'1': `/proposals/${proposalId}/metadata`,
	// 	'2': `/proposals/${proposalId}/description`,
	// 	'3': `/proposals/${proposalId}/transactions`,
	// 	'4': `/proposals/${proposalId}/address-book`,
	// })
	//
	const { proposal, initialized } = useServices();

	useInput(input => {
		if (input === 'q') {
			process.exit(0);
		}
	});

	if (initialized === false) {
		return <Loading />;
	}

	const router = createMemoryRouter(
		[
			{
				path: '/proposals/:id',
				element: <Proposal />,
				loader: async ({ params }) => proposal.load(parseInt(params.id || '')),
				errorElement: <Error />,
			},
		],
		{
			initialEntries: [`/proposals/${id}`],
			initialIndex: 0,
		},
	);

	return (
		<>
			<RouterProvider router={router} />
			<StatusBar />
		</>
	);
};
