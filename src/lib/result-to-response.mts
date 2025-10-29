import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { Result } from './types.mjs'

export type SuccessEnvelope<T> = {
  code: 'SUCCESS'
  data: T
}

export type ErrorResponse = {
  message: string
}

/**
 * Convert Result to properly typed HTTP response
 *
 * Success responses use envelope { code: 'SUCCESS', data: T } for future extensibility
 * Error responses use simple { message: string } format
 *
 * @param result - Result from command/repository
 * @param successStatus - HTTP status code for success (default 200)
 * @returns Function that takes Context and returns typed response
 *
 * @example
 * const result = await createOrganisation(data)
 * return resultToResponse(result, 201)(c)
 */
export const resultToResponse = <T,>(
  result: Result<T>,
  successStatus: ContentfulStatusCode = 200,
) => {
  return (c: Context) => {
    if (result.ok) {
      return c.json<SuccessEnvelope<T>, typeof successStatus>(
        { code: 'SUCCESS', data: result.value },
        successStatus,
      )
    }

    switch (result.error.code) {
      case 'NOT_FOUND':
        return c.json<ErrorResponse, 404>(
          { message: result.error.message },
          404,
        )
      case 'CONFLICT':
        return c.json<ErrorResponse, 409>(
          { message: result.error.message },
          409,
        )
      case 'VALIDATION_ERROR':
        return c.json<ErrorResponse, 400>(
          { message: result.error.message },
          400,
        )
      case 'UNAUTHORIZED':
        return c.json<ErrorResponse, 401>(
          { message: result.error.message },
          401,
        )
      case 'FORBIDDEN':
        return c.json<ErrorResponse, 403>(
          { message: result.error.message },
          403,
        )
      case 'SERVICE_UNAVAILABLE':
        return c.json<ErrorResponse, 503>(
          { message: 'The service is temporarily unavailable' },
          503,
        )
      default:
        return c.json<ErrorResponse, 500>(
          { message: 'An unexpected error occurred' },
          500,
        )
    }
  }
}
