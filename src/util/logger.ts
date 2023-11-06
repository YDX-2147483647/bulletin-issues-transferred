import process from 'node:process'
import { createLogger, format, transports } from 'winston'

const logger = createLogger({
    level: 'silly',
    format: format.combine(
        format.timestamp(),
        format.json(),
    ),
    transports: [
        new transports.File({ filename: 'output/combined.log' }),
    ],
})

if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new transports.Console({
            level: 'info',
            format: format.combine(
                format.colorize({ all: true }),
                format.simple(),
                format.printf((info) => {
                    const plugin = info.plugin ? `（${info.plugin}）` : ''
                    return `${info.level}: ${info.message}${plugin}`
                }),
            ),
        }),
    )
}

export { logger }
