import { useFocus, useInput } from 'ink';
type NavConfig = Record<string, () => void>;

export const useShortcut = (config: NavConfig, whenInFocusOf: string[]) => {
	let isActive = false;
	for (const focusTarget of whenInFocusOf) {
		const { isFocused } = useFocus({ id: focusTarget });
		isActive = isActive || isFocused;
	}

	useInput(
		input => {
			Object.keys(config).forEach(key => {
				if (input === key) {
					config[key]();
				}
			});
		},
		{
			isActive: isActive,
		},
	);
};
