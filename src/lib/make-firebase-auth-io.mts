import { backOff } from 'exponential-backoff'
import type { Logger } from './logger.mjs'
import type { Result } from './types.mjs'

const options = {
  numOfAttempts: 5,
  timeMultiple: 3,
  startingDelay: 200,
}

// Firebase Auth specific error detection
export const isFirebaseAuthRetryableError = (
  // biome-ignore lint/suspicious/noExplicitAny: Firebase error shape varies
  error: any,
): boolean => {
  // Firebase Auth error codes that should be retried
  const retryableCodes = [
    'auth/internal-error',
    'auth/network-request-failed',
    'auth/timeout',
    'auth/quota-exceeded',
  ]

  return (
    retryableCodes.includes(error.code) ||
    error.message?.includes('UNAVAILABLE') ||
    error.message?.includes('DEADLINE_EXCEEDED')
  )
}

// Map Firebase Auth errors to AppError codes
const mapFirebaseAuthError = (
  // biome-ignore lint/suspicious/noExplicitAny: Firebase error shape varies
  error: any,
): {
  code: 'NOT_FOUND' | 'CONFLICT' | 'SERVICE_UNAVAILABLE' | 'VALIDATION_ERROR'
  message: string
} => {
  switch (error.code) {
    case 'auth/user-not-found':
    case 'auth/tenant-not-found':
      return { code: 'NOT_FOUND', message: error.message }

    case 'auth/email-already-exists':
    case 'auth/phone-number-already-exists':
    case 'auth/uid-already-exists':
      return { code: 'CONFLICT', message: error.message }

    case 'auth/invalid-argument':
    case 'auth/invalid-email':
    case 'auth/invalid-password':
    case 'auth/invalid-phone-number':
    case 'auth/invalid-display-name':
    case 'auth/invalid-uid':
      return { code: 'VALIDATION_ERROR', message: error.message }

    default:
      return {
        code: 'SERVICE_UNAVAILABLE',
        message: error.message || 'Firebase Auth operation failed',
      }
  }
}

export const makeFirebaseAuthIOFn =
  <A, R>(fn: (args: A) => Promise<Result<R>>, logger: Logger) =>
  async (args: A): Promise<Result<R>> => {
    try {
      const result = await backOff(() => fn(args), {
        ...options,
        retry: isFirebaseAuthRetryableError,
      })
      return result
    } catch (cause) {
      logger.error({ error: cause }, '[firebase-auth-io] error')

      // Map Firebase Auth errors to our error codes
      const { code, message } = mapFirebaseAuthError(cause)

      return {
        ok: false,
        error: {
          cause,
          code,
          data: args,
          message,
        },
      }
    }
  }
