import winston from 'winston';
import paths from './paths.js';

export const logger = winston.createLogger({
	level: 'debug',
	format: winston.format.prettyPrint(),
	defaultMeta: { service: 'cgp-viewer' },
	transports: [
		new winston.transports.File({ filename: paths.log.error, level: 'error' }),
		new winston.transports.File({ filename: paths.log.combined }),
	],
});
