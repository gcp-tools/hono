import { backOff } from 'exponential-backoff'
import type { Logger } from './logger.mjs'
import type { Result } from './types.mjs'

const options = {
  numOfAttempts: 5,
  timeMultiple: 3,
  startingDelay: 200,
}

export const isPostgresRetryableError = (
  // biome-ignore lint/suspicious/noExplicitAny: postgres error shape
  error: any,
): boolean => {
  // Connection errors, deadlocks, temporary failures
  if (error?.code) {
    // PostgreSQL error codes that are retryable
    // 40001: serialization_failure
    // 40003: statement_completion_unknown
    // 40P01: deadlock_detected
    // 08000: connection_exception
    // 08003: connection_does_not_exist
    // 08006: connection_failure
    // 08001: sqlclient_unable_to_establish_sqlconnection
    // 08004: sqlserver_rejected_establishment_of_sqlconnection
    const retryableCodes = [
      '40001',
      '40003',
      '40P01',
      '08000',
      '08003',
      '08006',
      '08001',
      '08004',
    ]
    return retryableCodes.includes(error.code)
  }
  // Check for connection-related error messages
  return (
    error?.message?.includes('connection') ||
    error?.message?.includes('ECONNREFUSED') ||
    error?.message?.includes('ETIMEDOUT') ||
    error?.message?.includes('deadlock')
  )
}

// PostgreSQL unique/duplicate constraint violation
export const isPostgresUniqueViolation = (
  // biome-ignore lint/suspicious/noExplicitAny: postgres error shape
  error: any,
): boolean => error?.code === '23505'

export const makePostgresIOFn =
  <A, R>(fn: (args: A) => Promise<Result<R>>, logger: Logger) =>
  async (args: A): Promise<Result<R>> => {
    try {
      const result = await backOff(() => fn(args), {
        ...options,
        retry: isPostgresRetryableError,
      })
      return result
    } catch (cause) {
      logger.error({ error: cause }, '[postgres-io] error')
      if (isPostgresUniqueViolation(cause)) {
        return {
          ok: false,
          error: {
            cause,
            code: 'CONFLICT',
            data: args,
            message: 'Duplicate key violation',
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
