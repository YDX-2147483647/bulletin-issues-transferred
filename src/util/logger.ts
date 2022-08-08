import { createLogger, format, transports } from 'winston'

const logger = createLogger({
    level: 'info',
    format: format.json(),
    transports: [
        new transports.File({ filename: 'output/combined.log' }),
    ],
})

if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: format.combine(
            format.colorize({ all: true }),
            format.simple(),
        ),
    }))
}

export { logger }
