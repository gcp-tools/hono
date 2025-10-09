import { backOff } from 'exponential-backoff'
import { ZodError } from 'zod'
import type { MakeFirestoreIoFn } from './types.mjs'

const options = {
  numOfAttempts: 5,
  timeMultiple: 3,
  startingDelay: 200,
}

export const isResourceExhaustedError = (
  // biome-ignore lint/suspicious/noExplicitAny: crappy firestore shape
  error: any,
): error is { code: number; message: string } =>
  error.code === 8 ||
  error.code === 4 ||
  error.message?.includes('RESOURCE_EXHAUSTED') ||
  error.message?.includes('quota exceeded')

export const makeFirestoreIOFn: MakeFirestoreIoFn =
  (fn, logger) => async (args) => {
    try {
      const data = await backOff(() => fn(args), {
        ...options,
        retry: isResourceExhaustedError,
      })
      return {
        code: 'IO_SUCCESS',
        data,
      }
    } catch (error) {
      logger.error({ error }, '[firestore-io] error')
      if (error instanceof ZodError) {
        return {
          cause: error,
          code: 'VALIDATION_ERROR',
          data: args,
          message: 'Firestore data validation error',
        }
      }
      return {
        cause: error,
        code: 'SERVICE_UNAVAILABLE',
        data: args,
        message: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
