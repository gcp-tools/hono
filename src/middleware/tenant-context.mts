import { createMiddleware } from 'hono/factory'
import { z } from 'zod'
import type { TenantContext as TenantContextType } from '../lib/types.mjs'

type TenantContext = {
  ctx: TenantContextType
}

/**
 * Tenant context middleware for internal service-to-service calls.
 *
 * Requirements:
 * - x-correlation-id: Required UUID (for distributed tracing)
 * - x-role: Required string (role of the user making the request, passed from calling service)
 * - x-tenant-id: Optional UUID (tenant ID, passed from calling service)
 * - x-user-id: Required UUID (user making the request, passed from calling service)
 *
 */
export const tenantContext = createMiddleware<{ Variables: TenantContext }>(
  async (c, next) => {
    // Validate headers with Zod
    const headersSchema = z.object({
      'x-role': z.string('x-role must be a valid string'),
      'x-correlation-id': z.uuid('x-correlation-id must be a valid UUID'),
      'x-tenant-id': z.uuid('x-tenant-id must be a valid UUID'),
      'x-user-id': z.uuid('x-user-id must be a valid UUID'),
    })

    const result = headersSchema.safeParse({
      'x-role': c.req.header('x-role'),
      'x-correlation-id': c.req.header('x-correlation-id'),
      'x-tenant-id': c.req.header('x-tenant-id'),
      'x-user-id': c.req.header('x-user-id'),
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
      correlationId: result.data['x-correlation-id'],
      role: result.data['x-role'],
      tenantId: result.data['x-tenant-id'],
      userId: result.data['x-user-id'],
    })

    await next()
  },
)
