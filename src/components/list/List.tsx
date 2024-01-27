import { useStdoutDimensions } from '../../hooks/useStdoutDimensions.js';
import { useServices } from '../../providers/ServiceProvider.js';
import { logger } from '../../utils/logger.js';
import { Pane } from '../shared/Pane.js';
import { Text, useInput } from 'ink';

export const List = () => {
	const [width, height] = useStdoutDimensions();
	const { governance } = useServices();
	const data = governance.loadSuspense();
	logger.info(data);

	return (
		<Pane height={height - 3} title="Proposals">
			<Text>Hello</Text>
		</Pane>
	);
};
