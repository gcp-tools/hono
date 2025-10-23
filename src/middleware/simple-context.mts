import { createMiddleware } from 'hono/factory'
import { z } from 'zod'

export type SimpleContext = {
  ctx: {
    userId: string
    correlationId: string
  }
}

/**
 * Simplified context middleware for internal service-to-service calls.
 *
 * Requirements:
 * - x-user-id: Required UUID (user making the request, passed from calling service)
 * - x-correlation-id: Required UUID (for distributed tracing)
 *
 * This middleware is designed for internal services that don't need role-based
 * access control but need to maintain audit trails and trace context.
 *
 * Both headers are required and must be valid UUIDs.
 */
export const simpleContext = createMiddleware<{ Variables: SimpleContext }>(
  async (c, next) => {
    // Validate headers with Zod
    const headersSchema = z.object({
      'x-user-id': z.string().uuid('x-user-id must be a valid UUID'),
      'x-correlation-id': z
        .string()
        .uuid('x-correlation-id must be a valid UUID'),
    })

    const result = headersSchema.safeParse({
      'x-user-id': c.req.header('x-user-id'),
      'x-correlation-id': c.req.header('x-correlation-id'),
    })

    if (!result.success) {
      return c.json(
        {
          error: {
            code: 'BAD_REQUEST',
            message: 'Invalid or missing required headers',
            details: result.error.issues,
          },
        },
        400,
      )
    }

    // Set context object
    c.set('ctx', {
      userId: result.data['x-user-id'],
      correlationId: result.data['x-correlation-id'],
    })

    await next()
  },
)
