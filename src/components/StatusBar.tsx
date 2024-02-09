import React from 'react';
import { useStdoutDimensions } from '../hooks/useStdoutDimensions.js';
import { Text, Box } from 'ink';
import { useClient } from 'wagmi';
import { Pane } from './shared/Pane.js';

type Variant = 'proposal' | 'list';

type StatusBarProps = {
	variant: Variant;
};

type Shortcut = {
	key: string;
	description: string;
};

const SHORTCUTS: Record<Variant, Array<[string, string]>> = {
	proposal: [
		['1/2/3/4', 'to switch tabs'],
		['z', 'to zoom'],
		['j/k', 'to scroll'],
		['ENTER', 'to edit or set label'],
		['a', 'see all proposals'],
		['q', 'to quit'],
	],
	list: [
		['j/k', 'to scroll'],
		['ENTER', 'to view proposal'],
		['q', 'to quit'],
	],
};

export const StatusBar = ({ variant }: StatusBarProps) => {
	const [width] = useStdoutDimensions();
	const client = useClient();
	const nodeURL = client.transport['url'].split('//')[1];
	const shortcuts = SHORTCUTS[variant];

	return (
		<Pane title="Info" width={width}>
			<Box alignItems="center" flexGrow={1}>
				<Box flexGrow={0}>
					<Text> 📡 </Text>
					<Text>{client.chain.name}</Text>
					<Text> ({nodeURL})</Text>
				</Box>
				<Box flexGrow={1}></Box>
				<Box flexGrow={0}>
					{shortcuts.map(([key, description], index) => (
						<>
							<Text bold>{key}</Text>
							<Text> {description}</Text>
							{index < shortcuts.length - 1 && <Text> | </Text>}
						</>
					))}
					<Text> </Text>
				</Box>
			</Box>
		</Pane>
	);
};
