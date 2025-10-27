import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { Result } from './types.mjs'

/**
 * Success response envelope
 * Keeps code field for future extensibility (PARTIAL_SUCCESS, warnings, etc.)
 */
export type SuccessEnvelope<T> = {
  code: 'SUCCESS'
  data: T
}

/**
 * Error response - simple message format
 * No envelope needed as HTTP status code carries the semantic meaning
 */
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
      // Success with envelope for future extensibility
      return c.json<SuccessEnvelope<T>, typeof successStatus>(
        { code: 'SUCCESS', data: result.value },
        successStatus,
      )
    }

    // Error responses - no envelope, just message
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

/**
 * Legacy version for backward compatibility
 * Returns tuple format instead of function
 *
 * @deprecated Use new resultToResponse that returns function
 */
export const resultToResponseLegacy = <T,>(
  result: Result<T>,
  status: ContentfulStatusCode = 200,
): [SuccessEnvelope<T> | ErrorResponse, ContentfulStatusCode] => {
  if (result.ok) {
    return [{ code: 'SUCCESS', data: result.value }, status]
  }

  switch (result.error.code) {
    case 'NOT_FOUND':
      return [{ message: result.error.message }, 404]
    case 'CONFLICT':
      return [{ message: result.error.message }, 409]
    case 'VALIDATION_ERROR':
      return [{ message: result.error.message }, 400]
    case 'UNAUTHORIZED':
      return [{ message: result.error.message }, 401]
    case 'FORBIDDEN':
      return [{ message: result.error.message }, 403]
    case 'SERVICE_UNAVAILABLE':
      return [{ message: 'The service is temporarily unavailable' }, 503]
    default:
      return [{ message: 'An unexpected error occurred' }, 500]
  }
}
