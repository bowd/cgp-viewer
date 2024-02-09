import React, { useEffect, Suspense } from 'react';
import {
	Outlet,
	RouterProvider,
	createMemoryRouter,
	useNavigate,
	useRouteError,
} from 'react-router-dom';
import { Text, useFocus, useFocusManager, useInput } from 'ink';

import { Proposal } from './components/proposal/Proposal.js';
import { StatusBar } from './components/StatusBar.js';

import { logger } from './utils/logger.js';
import { useServices } from './providers/ServiceProvider.js';
import { Loading } from './components/shared/Loading.js';
import { List } from './components/list/List.js';
import { Help } from './components/Help.js';
import { useShortcut } from './hooks/useShortcut.js';

const Error = () => {
	const error = useRouteError() as Error;
	logger.error(error);
	return <Text color="red">{error.message}</Text>;
};

const Base = () => {
	const { initialized } = useServices();
	const navigate = useNavigate();

	useShortcut(
		{
			q: () => process.exit(0),
			a: () => navigate('/proposals/'),
		},
		[
			'metadata',
			'description',
			'transactions',
			'addressbook',
			'proposals',
			'help',
		],
	);

	if (initialized === false) {
		return <Loading />;
	}

	return <Outlet />;
};

export const App = ({ id }: { id: number | null }) => {
	let initialEntries: string[] = ['/proposals/'];
	if (id !== null && !isNaN(id)) {
		initialEntries[0] = `/proposals/${id}`;
	}

	const router = createMemoryRouter(
		[
			{
				path: '/',
				element: <Base />,
				errorElement: <Error />,
				children: [
					{
						path: '/proposals/:id',
						element: (
							<>
								<Proposal />
								<StatusBar variant="proposal" />
							</>
						),
						errorElement: <Error />,
					},
					{
						path: '/proposals/',
						element: (
							<>
								<List />
								<StatusBar variant="list" />
							</>
						),
						errorElement: <Error />,
					},
					{
						path: '/help/',
						element: <Help />,
						errorElement: <Error />,
					},
				],
			},
		],
		{
			initialEntries,
			initialIndex: 0,
		},
	);

	return (
		<React.Suspense fallback={<Loading />}>
			<RouterProvider router={router} />
		</React.Suspense>
	);
};
