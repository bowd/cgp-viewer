import React, { useEffect, Suspense } from 'react';
import { Box, Text, useFocus, useInput } from 'ink';
import { useStdoutDimensions } from '../hooks/useStdoutDimensions.js';

export const Help = () => {
	const [width, height] = useStdoutDimensions();

	const boxWidth = Math.min(60, width);
	const boxHeight = Math.min(24, height);
	const marginTop = -1 * (boxHeight + (height - boxHeight) / 2);
	const marginLeft = (width - boxWidth) / 2;

	return (
		<Box
			borderStyle="bold"
			width={boxWidth}
			height={boxHeight}
			marginTop={marginTop}
			marginLeft={marginLeft}
		>
			<Text>Help</Text>
		</Box>
	);
};
