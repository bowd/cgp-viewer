import os from 'node:os';
import path from 'node:path';

export const config = path.join(os.homedir(), '.config', 'cgp-viewer');
export const cache = path.join(os.homedir(), '.cache', 'cgp-viewer');
export const logCombined = path.join(cache, 'combined.log');
export const logError = path.join(cache, 'error.log');
export const metadataDir = path.join(cache, 'metadata');
