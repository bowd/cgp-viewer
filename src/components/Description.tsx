import React, { useEffect, useMemo } from 'react';
import { IProposal } from '../services/proposals.js';
import { Text, Box, useFocus } from 'ink';
import { useStdoutDimensions } from '../hooks/useStdoutDimensions.js';
import { parse, setOptions } from 'marked';
// @ts-ignore
import TerminalRenderer from 'marked-terminal';
import { useInput } from 'ink';
import { logger } from '../utils/logger.js';
import { Pane } from './Pane.js';
import { useAddressBook } from '../hooks/useAddressBook.js';
import { Address } from 'viem';

type Props = {
	children: string;
};

const Markdown = ({ children, ...options }: Props) => {
	const [width] = useStdoutDimensions();
	const { highlightedIdentifier } = useAddressBook();

	setOptions({
		renderer: new TerminalRenderer({
			...options,
			width: width - 10,
		}),
	});

	const parsed = useMemo(() => {
		const text = (parse(children) as string)
			.trim()
			.split('\n')
			.slice(1)
			.join('\n')
			.trim();

		if (highlightedIdentifier) {
			return text
				.replace(
					highlightedIdentifier,
					`\x1b[44m\x1b[30m\x1b[1m${highlightedIdentifier}\x1b[0m`,
				)
				.replace(
					highlightedIdentifier.toLowerCase(),
					`\x1b[44m[\x1b30m\x1b[1m${highlightedIdentifier.toLowerCase()}\x1b[0m`,
				);
		}

		return text;
	}, [parse, children, highlightedIdentifier]);

	return <Text>{parsed}</Text>;
};

export const Description = ({
	proposal,
	height,
}: {
	proposal: IProposal;
	height: number;
}) => {
	const [scrollTop, setScrollTop] = React.useState(-1);
	const { isFocused } = useFocus({ id: '2' });

	useInput(
		input => {
			if (input === 'j') {
				setScrollTop(scrollTop + 1);
			} else if (input === 'k') {
				setScrollTop(scrollTop - 1);
			}
		},
		{ isActive: isFocused },
	);

	return (
		<Pane title="Description" focusId="2" height={height}>
			<Box overflow="hidden" height={height - 2}>
				<Box marginTop={-scrollTop}>
					<Markdown>{proposal.description}</Markdown>
				</Box>
			</Box>
		</Pane>
	);
};
