import React from 'react';
import { useStdoutDimensions } from '../hooks/useStdoutDimensions.js';
import { Text, Box } from 'ink';
import { useClient } from 'wagmi';
// import { logger } from '../utils/logger.js';

export const StatusBar = () => {
	const [width] = useStdoutDimensions();
	const client = useClient();
	const nodeURL = client.transport['url'].split('//')[1];

	return (
		<Box borderStyle="round" width={width} height={3}>
			<Box marginLeft={1} marginTop={-1}>
				<Text bold>Info</Text>
			</Box>
			<Box marginLeft={-4}>
				<Text>⚡️ {nodeURL}</Text>
			</Box>
		</Box>
	);
};
