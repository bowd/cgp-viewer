import { useStdoutDimensions } from '../../hooks/useStdoutDimensions.js';
import Spinner from 'ink-spinner';
import { Text, Box } from 'ink';

export const Loading = () => {
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
