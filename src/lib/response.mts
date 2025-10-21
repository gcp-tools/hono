import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { CmdResponse } from './types.mjs'

export const response = <T,>(
  result: CmdResponse<T>,
  status: ContentfulStatusCode = 200,
): [{ code: string; data: T | { message: string } }, ContentfulStatusCode] => {
  switch (result.code) {
    case 'CMD_SUCCESS':
      return [
        {
          code: 'SUCCESS',
          data: result.data,
        },
        status,
      ]
    case 'NOT_FOUND':
      return [
        {
          code: result.code,
          data: { message: result.message },
        },
        404,
      ]
    case 'CONFLICT':
      return [
        {
          code: result.code,
          data: { message: result.message },
        },
        409,
      ]
    case 'VALIDATION_ERROR':
      return [
        {
          code: 'INTERNAL_SERVER_ERROR',
          data: { message: 'An unexpected error occurred' },
        },
        500,
      ]
    case 'SERVICE_UNAVAILABLE':
      return [
        {
          code: result.code,
          data: { message: 'The service is temporarily unavailable' },
        },
        503,
      ]
    default:
      return [
        {
          code: 'INTERNAL_SERVER_ERROR',
          data: { message: 'An unexpected error occurred' },
        },
        500,
      ]
  }
}
