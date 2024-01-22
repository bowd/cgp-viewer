import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const makePaths = () => {
	const config = path.join(os.homedir(), '.config', 'cgp-viewer');
	const cache = path.join(os.homedir(), '.cache', 'cgp-viewer');
	const metadata = path.join(cache, 'metadata');

	fs.mkdirSync(config, { recursive: true });
	fs.mkdirSync(metadata, { recursive: true });

	return {
		config,
		cache,
		metadata,
		log: {
			combined: path.join(cache, 'combined.log'),
			error: path.join(cache, 'error.log'),
		},
		addressbook: path.join(config, 'addressbook.toml'),
		matadataFile: (chainId: number, address: string) => {
			return path.join(metadata, `${address}.${chainId}.json`);
		},
	};
};

export default makePaths();
