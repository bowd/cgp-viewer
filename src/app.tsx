import React from 'react';
import { Text, Box } from 'ink';
import { useKey } from './hooks/useKey.js';
import { useStdoutDimensions } from './hooks/useStdoutDimensions.js';
// import { useEffect } from 'react';

type Props = {
	name: string | undefined;
};

export default function App({ name = 'Stranger' }: Props) {
	useKey(
		['escape', 'leftArrow'],
		() => {
			console.error('asd');
		},
		true,
	);
	const [width, height] = useStdoutDimensions();
	// const { setRawMode } = useStdin();

	// useEffect(() => {
	// 	setRawMode(true);
	// 	return () => {
	// 		setRawMode(false);
	// 	};
	// });

	return (
		<Box
			width={width}
			height={height}
			alignSelf="center"
			justifyContent="center"
		>
			<Text>
				Hello, <Text color="green">{name}</Text>
			</Text>
			<Text>
				Width: {width}
				Height: {height}
			</Text>
		</Box>
	);
}
