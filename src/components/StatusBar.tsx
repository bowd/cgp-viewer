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
		<Box borderStyle="round" borderColor="grey" width={width} height={3}>
			<Box marginLeft={1} marginTop={-1}>
				<Text bold>Info</Text>
			</Box>
			<Box marginLeft={-4} alignItems="center" flexGrow={1}>
				<Box flexGrow={0}>
					<Text>📡 </Text>
					<Text>{client.chain.name}</Text>
					<Text> ({nodeURL})</Text>
				</Box>
				<Box flexGrow={1}></Box>
				<Box flexGrow={0}>
					<Text bold>1/2/3</Text>
					<Text> to switch tabs</Text>
					<Text> | </Text>
					<Text bold>q</Text>
					<Text> to quit</Text>
					<Text> | </Text>
					<Text bold>j/k</Text>
					<Text> to scroll </Text>
				</Box>
			</Box>
		</Box>
	);
};
