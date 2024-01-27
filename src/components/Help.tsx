import React, { useEffect, Suspense } from 'react';
import { Box, Text, useFocus, useInput } from 'ink';
import { useStdoutDimensions } from '../hooks/useStdoutDimensions.js';
import { Pane } from './shared/Pane.js';

export const Help = () => {
	const [width, height] = useStdoutDimensions();

	return (
		<Pane height={height - 3} title="Help">
			<Text>hocredux</Text>
		</Pane>
	);
};
