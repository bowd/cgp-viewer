import React, { useEffect, Suspense } from 'react';
import {
	RouterProvider,
	createMemoryRouter,
	useRouteError,
} from 'react-router-dom';
import { Text, useInput } from 'ink';

import { Proposal } from './components/proposal/Proposal.js';
import { StatusBar } from './components/StatusBar.js';

import { logger } from './utils/logger.js';
import { useServices } from './providers/ServiceProvider.js';
import { Loading } from './components/shared/Loading.js';

const Error = () => {
	const error = useRouteError() as Error;
	logger.error(error);
	return <Text color="red">{error.message}</Text>;
};

export const App = ({ id }: { id: number }) => {
	const { initialized } = useServices();

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
			<React.Suspense fallback={<Loading />}>
				<RouterProvider router={router} />
			</React.Suspense>
			<StatusBar />
		</>
	);
};
