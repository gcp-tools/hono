import { backOff } from 'exponential-backoff'
import { ZodError } from 'zod'
import type { Logger } from './logger.mjs'
import type { Result } from './types.mjs'

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

export const makeFirestoreIOFn =
  <A, R>(fn: (args: A) => Promise<R>, logger: Logger) =>
  async (args: A): Promise<Result<R>> => {
    try {
      const data = await backOff(() => fn(args), {
        ...options,
        retry: isResourceExhaustedError,
      })
      return { ok: true, value: data }
    } catch (cause) {
      logger.error({ error: cause }, '[firestore-io] error')
      if (cause instanceof ZodError) {
        return {
          ok: false,
          error: {
            cause,
            code: 'VALIDATION_ERROR',
            data: args,
            message: 'Firestore data validation error',
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
