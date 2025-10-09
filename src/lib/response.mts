import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { CmdResponse } from './types.mjs'

export const response = (
  result: CmdResponse<unknown>,
  status: ContentfulStatusCode = 200,
): [unknown, ContentfulStatusCode] => {
  switch (result.code) {
    case 'CMD_SUCCESS':
      return [result.data, status]
    case 'NOT_FOUND':
      return [
        {
          code: result.code,
          message: result.message,
        },
        404,
      ]
    case 'CONFLICT':
      return [
        {
          code: result.code,
          message: result.message,
        },
        409,
      ]
    case 'VALIDATION_ERROR':
      return [
        {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        },
        500,
      ]
    case 'SERVICE_UNAVAILABLE':
      return [
        {
          code: result.code,
          message: 'The service is temporarily unavailable',
        },
        503,
      ]
    default:
      return [
        {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        },
        500,
      ]
  }
}
