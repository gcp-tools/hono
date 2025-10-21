import { backOff } from 'exponential-backoff'
import { DetailedError } from 'hono/client'
import type { Logger } from './logger.mjs'
import type { MakeServiceIoFn } from './types.mjs'

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
export const makeServiceIOFn: MakeServiceIoFn =
  (fn, logger) =>
  async (args) => {
    try {
      const data = await backOff(() => fn(args), {
        ...options,
        retry: isServiceUnavailableError,
      })
      return {
        code: 'IO_SUCCESS',
        data,
      }
    } catch (error) {
      logger.error({ error }, '[service-io] error')

      const isServiceUnavailable = isServiceUnavailableError(error)
      if (isServiceUnavailable) {
        return {
          cause: error,
          code: 'SERVICE_UNAVAILABLE',
          data: args,
          message: 'Service unavailable',
        }
      }

      if (error instanceof DetailedError) {
        return {
          cause: error,
          code: 'VALIDATION_ERROR',
          data: args,
          message: error.message,
        }
      }

      return {
        cause: error,
        code: 'SERVICE_UNAVAILABLE',
        data: args,
        message:
          error instanceof Error ? error.message : 'Unknown service error',
      }
    }
  }
