import React, { useEffect } from 'react';
import { IProposal } from '../services/proposals.js';
import { Text, Box, useFocus } from 'ink';
import { useStdoutDimensions } from '../hooks/useStdoutDimensions.js';
import { parse, setOptions } from 'marked';
// @ts-ignore
import TerminalRenderer from 'marked-terminal';
import { useInput } from 'ink';
import { logger } from '../utils/logger.js';

type Props = {
	children: string;
	width: number;
};

function Markdown({ children, ...options }: Props) {
	const [width] = useStdoutDimensions();
	setOptions({
		renderer: new TerminalRenderer({
			...options,
			width: width - 10,
		}),
	});
	return <Text>{(parse(children) as string).trim()}</Text>;
}

export const Description = ({
	proposal,
	height,
}: {
	proposal: IProposal;
	height: number;
}) => {
	const title = 'Description [2]';
	const [scrollTop, setScrollTop] = React.useState(0);
	const { isFocused } = useFocus({ id: '2' });

	useInput(
		(input, key) => {
			if (input === 'j') {
				setScrollTop(scrollTop + 1);
			} else if (input === 'k') {
				setScrollTop(scrollTop - 1);
			}
		},
		{ isActive: isFocused },
	);

	return (
		<Box
			borderStyle="round"
			height={height}
			borderColor={isFocused ? 'white' : 'grey'}
		>
			<Box marginLeft={1} marginTop={-1} width={title.length + 2}>
				<Text bold>{title}</Text>
			</Box>
			<Box marginLeft={-1 * (title.length + 2)} overflow="hidden" padding={1}>
				<Box flexShrink={0} flexDirection="column" marginTop={-scrollTop}>
					<Markdown width={40}>{proposal.description}</Markdown>
				</Box>
			</Box>
		</Box>
	);
};
