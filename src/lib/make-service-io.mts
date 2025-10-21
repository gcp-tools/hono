import { backOff } from 'exponential-backoff'
import { DetailedError } from 'hono/client'
import type { Logger } from './logger.mjs'
import type { Result } from './types.mjs'

const options = {
  numOfAttempts: 5,
  timeMultiple: 3,
  startingDelay: 200,
}

export const isServiceUnavailableError = (
  // biome-ignore lint/suspicious/noExplicitAny: various error shapes possible
  error: any,
): error is { status?: number; code?: number; message?: string } => {
  // Handle HTTP response errors
  if (error.status) {
    return (
      error.status === 429 || // Too Many Requests
      error.status === 500 || // Internal Server Error
      error.status === 502 || // Bad Gateway
      error.status === 503 || // Service Unavailable
      error.status === 504 // Gateway Timeout
    )
  }

  // Handle network/connection errors
  if (error.code) {
    return (
      error.code === 8 || // RESOURCE_EXHAUSTED
      error.code === 4 || // DEADLINE_EXCEEDED
      error.message?.includes('RESOURCE_EXHAUSTED') ||
      error.message?.includes('quota exceeded') ||
      error.message?.includes('timeout') ||
      error.message?.includes('ECONNRESET') ||
      error.message?.includes('ENOTFOUND') ||
      error.message?.includes('ECONNREFUSED')
    )
  }

  return false
}

export const makeServiceIOFn =
  <A, R>(fn: (args: A) => Promise<Result<R>>, logger: Logger) =>
  async (args: A): Promise<Result<R>> => {
    try {
      const result = await backOff(() => fn(args), {
        ...options,
        retry: (error) => {
          // Only retry service unavailable errors, not business logic errors
          return isServiceUnavailableError(error)
        },
      })
      return result
    } catch (cause) {
      logger.error({ error: cause }, '[service-io] error')

      const isServiceUnavailable = isServiceUnavailableError(cause)
      if (isServiceUnavailable) {
        return {
          ok: false,
          error: {
            cause,
            code: 'SERVICE_UNAVAILABLE',
            data: args,
            message: 'Service unavailable',
          },
        }
      }

      if (cause instanceof DetailedError) {
        return {
          ok: false,
          error: {
            cause,
            code: 'VALIDATION_ERROR',
            data: args,
            message: cause.message,
          },
        }
      }

      return {
        ok: false,
        error: {
          cause,
          code: 'SERVICE_UNAVAILABLE',
          data: args,
          message:
            cause instanceof Error ? cause.message : 'Unknown service error',
        },
      }
    }
  }
