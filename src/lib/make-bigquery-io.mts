import { backOff } from 'exponential-backoff'
import { ZodError } from 'zod'
import type { Logger } from './logger.mjs'
import type { Result } from './types.mjs'

const options = {
  numOfAttempts: 5,
  timeMultiple: 3,
  startingDelay: 200,
}

export const isBigQueryRetryableError = (
  // biome-ignore lint/suspicious/noExplicitAny: bigquery error shape
  error: any,
): boolean => {
  // BigQuery error codes that are retryable
  if (error?.code) {
    // 429: Too Many Requests
    // 500: Internal Server Error
    // 503: Service Unavailable
    // 504: Gateway Timeout
    const retryableCodes = [429, 500, 503, 504]
    if (retryableCodes.includes(error.code)) {
      return true
    }
  }
  // Check for quota/rate limit errors
  return (
    error?.code === 8 ||
    error?.code === 4 ||
    error?.message?.includes('RESOURCE_EXHAUSTED') ||
    error?.message?.includes('quota exceeded') ||
    error?.message?.includes('rate limit') ||
    error?.message?.includes('jobBackoff') ||
    error?.message?.includes('backendError')
  )
}

export const makeBigQueryIOFn =
  <A, R>(fn: (args: A) => Promise<Result<R>>, logger: Logger) =>
  async (args: A): Promise<Result<R>> => {
    try {
      const result = await backOff(() => fn(args), {
        ...options,
        retry: isBigQueryRetryableError,
      })
      return result
    } catch (cause) {
      logger.error({ error: cause }, '[bigquery-io] error')
      if (cause instanceof ZodError) {
        return {
          ok: false,
          error: {
            cause,
            code: 'VALIDATION_ERROR',
            data: args,
            message: 'BigQuery data validation error',
          },
        }
      }
      return {
        ok: false,
        error: {
          cause,
          code: 'SERVICE_UNAVAILABLE',
          data: args,
          message: cause instanceof Error ? cause.message : 'Unknown error',
        },
      }
    }
  }
