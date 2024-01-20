import React, { useEffect, Suspense } from 'react';
import { useKey } from './hooks/useKey.js';
import { Proposal } from './components/Proposal.js';
import { StatusBar } from './components/StatusBar.js';
import { useClient } from 'wagmi';
import { proposalLoader } from './services/proposals.js';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { useStdoutDimensions } from './hooks/useStdoutDimensions.js';

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
	useKey('q' as any, () => process.exit(0), true);
	const client = useClient();
	const [ready, setReady] = React.useState(false);
	useEffect(() => {
		proposalLoader.init(client).then(() => setReady(true));
	}, [client, setReady]);

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
