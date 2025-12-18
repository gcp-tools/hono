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

// PostgreSQL transaction state errors
export const isPostgresTransactionError = (
  // biome-ignore lint/suspicious/noExplicitAny: postgres error shape
  error: any,
): boolean => {
  if (error?.code) {
    // PostgreSQL error codes for transaction state issues
    // 25P01: no_active_sql_transaction - Operation attempted outside a transaction
    // 25P02: in_failed_sql_transaction - Operation attempted in a failed transaction
    const transactionErrorCodes = ['25P01', '25P02']
    return transactionErrorCodes.includes(error.code)
  }
  // Check for specific transaction state error messages as fallback
  const message = error?.message?.toLowerCase() || ''
  return (
    message.includes('no active sql transaction') ||
    message.includes('in failed sql transaction') ||
    message.includes('current transaction is aborted') ||
    message.includes('transaction is aborted')
  )
}

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
      // Check for transaction errors first - these indicate unrecoverable transaction state
      if (isPostgresTransactionError(cause)) {
        const errorMessage =
          cause instanceof Error ? cause.message : 'Transaction state error'
        logger.error(
          { error: cause, transactionError: true },
          '[postgres-io] transaction error',
        )
        return {
          ok: false,
          error: {
            cause,
            code: 'DATA_CORRUPTION',
            data: args,
            message: errorMessage,
          },
        }
      }
      // Check for unique constraint violations
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
      // Generic error handling
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
