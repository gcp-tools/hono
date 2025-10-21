import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { HttpResponse, Result } from './types.mjs'

export const response = <T,>(
  result: Result<T>,
  status: ContentfulStatusCode = 200,
): [HttpResponse<T>, ContentfulStatusCode] => {
  if (result.ok) {
    return [
      {
        code: 'SUCCESS',
        data: result.value,
      },
      status,
    ]
  }

  switch (result.error.code) {
    case 'NOT_FOUND':
      return [
        {
          code: result.error.code,
          data: { message: result.error.message },
        },
        404,
      ]
    case 'CONFLICT':
      return [
        {
          code: result.error.code,
          data: { message: result.error.message },
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
          code: result.error.code,
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
