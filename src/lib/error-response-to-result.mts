import { DetailedError } from 'hono/client'
import type { Err } from './types.mjs'

export const errorResponseToResult = (error: unknown): Err => {
  if (error instanceof DetailedError) {
    switch (error.statusCode) {
      case 401:
        return {
          ok: false,
          error: {
            code: 'UNAUTHORIZED',
            message: error.detail?.statusText || 'Unauthorized',
            data: error.detail?.data,
          },
        }
      case 403:
        return {
          ok: false,
          error: {
            code: 'FORBIDDEN',
            message: error.detail?.statusText || 'Forbidden',
            data: error.detail?.data,
          },
        }
      case 404:
        return {
          ok: false,
          error: {
            code: 'NOT_FOUND',
            message: error.detail?.statusText || 'Not found',
            data: error.detail?.data,
          },
        }
      case 409:
        return {
          ok: false,
          error: {
            code: 'CONFLICT',
            message: error.detail?.statusText || 'Conflict',
            data: error.detail?.data,
          },
        }
      default:
        return {
          ok: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: error.detail?.statusText || 'Service error',
            data: error.detail?.data,
          },
        }
    }
  }
  return {
    ok: false,
    error: {
      code: 'SERVICE_UNAVAILABLE',
      message: 'Internal server error',
      data: {},
    },
  }
}
