import { createMiddleware } from 'hono/factory'
import type { RequestContext } from '../lib/types.mjs'

export const requireRole = (requiredRole: string) =>
  createMiddleware<{
    Variables: { ctx: RequestContext }
    // //@ts-expect-error TS7030 - middleware doesn't require explicit return
  }>(async (c, next) => {
    const ctx = c.get('ctx')

    if (ctx.role !== requiredRole) {
      return c.json(
        {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
        403,
      )
    }

    await next()
  })
