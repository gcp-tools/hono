import { LoggingBunyan } from '@google-cloud/logging-bunyan'
import bunyan from 'bunyan'

export type Logger = bunyan

export const createLogger = (serviceName: string): Logger => {
  const loggingBunyan = new LoggingBunyan({
    maxEntrySize: 1048576,
    redirectToStdout: true,
    useMessageField: false,
  })

  return bunyan.createLogger({
    name: serviceName,
    src: false,
    streams: [loggingBunyan.stream('debug')],
  })
}

export const createChildLogger = (
  logger: Logger,
  fields: Record<string, unknown>,
): Logger => logger.child(fields)
