import { createMiddleware } from 'hono/factory'
import { ZodError } from 'zod'

export const errorHandler = createMiddleware(async (c, next) => {
  try {
    await next()
  } catch (error) {
    const logger = c.get('requestLogger')

    if (error instanceof ZodError) {
      logger.error({ issues: error.issues }, '[400] validation error')
      const response = {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request parameters',
        details: { issues: error.issues },
      }
      return c.json(response, 400)
    }

    logger.error({ error }, '[500] internal server error')
    const response = {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    }
    return c.json(response, 500)
  }
})
