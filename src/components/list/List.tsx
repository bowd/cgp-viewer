import { Suspense, useEffect, useState } from 'react';
import { useStdoutDimensions } from '../../hooks/useStdoutDimensions.js';
import { useServices } from '../../providers/ServiceProvider.js';
import { logger } from '../../utils/logger.js';
import { Pane } from '../shared/Pane.js';
import { Box, Text, useFocus, useInput } from 'ink';
import { IListProposal, Stage } from '../../services/types.js';
import { useNavigate } from 'react-router-dom';
import { Loading } from '../shared/Loading.js';
import { Preview } from '../proposal/Preview.js';

export const List = () => {
	const [width, height] = useStdoutDimensions();
	const { governance } = useServices();
	const navigate = useNavigate();
	const data = governance.loadSuspense();
	const [selected, setSelected] = useState(0);
	const { focus, isFocused } = useFocus({ id: 'proposals' });
	useEffect(() => focus('proposals'), []);

	useInput(
		(input, key) => {
			if (input === 'j') {
				setSelected(selected =>
					Math.min(selected + 1, data.proposals.length - 1),
				);
			} else if (input === 'k') {
				setSelected(selected => Math.max(selected - 1, 0));
			} else if (key.return) {
				navigate(`/proposals/${data.proposals[selected].id}`);
			}
		},
		{ isActive: isFocused },
	);

	const maxShown = height - 5;
	const offset = Math.max(selected - maxShown + 1, 0);

	return (
		<Pane
			height={height - 3}
			focusId="proposals"
			title="Proposals"
			width={width}
		>
			<Box flexDirection="row">
				<Box
					overflow="hidden"
					height={height - 2}
					width={25}
					flexDirection="column"
				>
					{data.proposals
						.slice(offset, offset + maxShown)
						.map((proposal, index) => (
							<Box key={proposal.id}>
								{selected === index + offset ? (
									<Text> {'>'} </Text>
								) : (
									<Text>{'   '}</Text>
								)}
								<Text color={selected === index + offset ? 'yellow' : 'white'}>
									{proposal.id.toString().padStart(3, ' ')} -{' '}
								</Text>
								<Text color="grey">{proposal.stage}</Text>
							</Box>
						))}
				</Box>
				<Box
					flexDirection="column"
					width={width - 25}
					borderStyle="single"
					borderTop={false}
					borderBottom={false}
					borderRight={false}
					paddingLeft={2}
				>
					<Suspense fallback={<Loading />}>
						<Preview id={data.proposals[selected].id} />
					</Suspense>
				</Box>
			</Box>
		</Pane>
	);
};
