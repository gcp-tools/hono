import { backOff } from 'exponential-backoff'
import type { DetailedError } from 'hono/client'
import { errorResponseToResult } from './error-response-to-result.mjs'
import type { Logger } from './logger.mjs'
import type { Result } from './types.mjs'

const options = {
  numOfAttempts: 5,
  timeMultiple: 3,
  startingDelay: 200,
}

export const isServiceUnavailableError = (error: DetailedError): boolean => {
  const e = errorResponseToResult(error)
  return e.error.code === 'SERVICE_UNAVAILABLE'
}

export const makeServiceIOFn =
  <A, R>(fn: (args: A) => Promise<R>, logger: Logger) =>
  async (args: A): Promise<Result<R>> => {
    try {
      const result = await backOff(() => fn(args), {
        ...options,
        retry: (error) => {
          // Only retry service unavailable errors, not business logic errors
          return isServiceUnavailableError(error)
        },
      })
      return { ok: true, value: result }
    } catch (error) {
      logger.error({ error }, '[service-io] error')
      return errorResponseToResult(error)
    }
  }
