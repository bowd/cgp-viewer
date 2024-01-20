import { Logger } from 'tslog';
import { appendFileSync, mkdirSync } from 'fs';
import os from 'node:os';
import path from 'node:path';

const home = os.homedir();
const logDir = path.join(home, '.cache/cgp-viewer');
const logFile = path.join(logDir, 'log');

mkdirSync(logDir, { recursive: true });
export const logger = new Logger({ type: 'hidden' });
logger.attachTransport(logObj => {
	appendFileSync(logFile, JSON.stringify(logObj) + '\n');
});

console.log = logger.info.bind(logger);
console.warn = logger.warn.bind(logger);
console.debug = logger.debug.bind(logger);
console.error = logger.error.bind(logger);
