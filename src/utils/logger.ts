import winston from 'winston';
import { logCombined, logError } from './paths.js';

export const logger = winston.createLogger({
	level: 'debug',
	format: winston.format.prettyPrint(),
	defaultMeta: { service: 'cgp-viewer' },
	transports: [
		new winston.transports.File({ filename: logError, level: 'error' }),
		new winston.transports.File({ filename: logCombined }),
	],
});
