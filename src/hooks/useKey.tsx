import { useInput } from './useInput.js';
import { checkSuperKey, SuperKey } from './useSelection.js';

export const useKey = (
	key: SuperKey | SuperKey[],
	handler: (input: string) => void,
	focused = false,
) => {
	return useInput(input => {
		if (checkSuperKey(input, key)) {
			handler(input.raw);
		}
	}, focused);
};
