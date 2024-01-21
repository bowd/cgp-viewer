import React from 'react';
import { Text, Box, BoxProps, useFocus } from 'ink';

type PaneProps = BoxProps & {
	title: string;
	focusId?: string;
	children: React.ReactNode;
};

export const Pane = (props: PaneProps) => {
	const { title: _title, focusId, children, ...boxProps } = props;
	const title = ` ${focusId ? `${_title} [${focusId}]` : _title} `;

	const { isFocused } = useFocus({ id: focusId });
	const textColor = isFocused ? 'yellow' : 'white';
	const borderColor = isFocused ? 'yellow' : 'grey';

	if (props.height === 0) {
		return null;
	}

	return (
		<Box
			borderStyle="single"
			borderColor={borderColor}
			flexDirection="column"
			{...boxProps}
		>
			<Box marginLeft={1} marginTop={-1} width={title.length}>
				<Text bold color={textColor}>
					{title}
				</Text>
			</Box>
			<Box flexDirection="column">{children}</Box>
		</Box>
	);
};
