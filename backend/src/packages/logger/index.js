import { createLogger, transports, format } from 'winston';
import { join } from 'path';
import fs from 'fs';

const logsDir = join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const {
    combine, timestamp,
    printf, colorize,
    splat, simple
} = format;

const logger = createLogger({
    level: 'info',
    // log's format is defined through combine
    format: format.json(),
    transports: [
    // show log on console
        new transports.Console({
            level: 'info',
            format: combine(
                simple(), splat(),
                timestamp({
                    format: 'DD-MM-YYYY HH:mm:ss',
                }),
                colorize(),
                printf(log => {
                    if (log.stack) return `[${log.timestamp}] [${log.level}] ${log.stack}`;
                    return `[${log.timestamp}] [${log.level}] ${log.message}`;
                })
            )
        }),
        // write errors to file
        new transports.File({
            filename: join(process.cwd(), 'logs/errors.log'),
            level: 'error',
            format: simple(),
        }),
        new transports.File({
            filename: join(process.cwd(), 'logs/combined.log'),
            level: 'info',
            format: format.json(),
        })
    ],
});

const httpLoggerStream = {
    write: message => logger.info(message.trim()),
};

export { httpLoggerStream, logger };
