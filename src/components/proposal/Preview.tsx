import { Box } from 'ink';
import { useServices } from '../../providers/ServiceProvider.js';
import { useStdoutDimensions } from '../../hooks/useStdoutDimensions.js';
import { Markdown } from './Description.js';

export const Preview = ({ id }: { id: number }) => {
	const [_, height] = useStdoutDimensions();
	const { proposal: proposalService } = useServices();
	const proposal = proposalService.loadSuspense(id);

	return (
		<Box overflow="hidden" height={height - 7}>
			<Markdown>{proposal.description}</Markdown>
		</Box>
	);
};
