import { http, createConfig, Config } from 'wagmi';
import { chains } from './chains.js';

export const makeConfig = (
	chainName: 'celo' | 'alfajores' | 'baklava',
	nodeOverride?: string,
): Config => {
	const chain = chains.find(c => c.name.toLowerCase() === chainName);

	if (chain === undefined) {
		console.error('Invalid chain name');
		process.exit(1);
	}

	return createConfig({
		chains: [chain],
		transports: {
			[chain.id]: http(nodeOverride),
		},
	});
};
