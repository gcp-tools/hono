import { createMiddleware } from 'hono/factory'
import type { RequestContext } from '../lib/types.mjs'

export const requireTenant = () =>
  createMiddleware<{
    Variables: { ctx: RequestContext }
    // //@ts-expect-error TS7030 - middleware doesn't require explicit return
  }>(async (c, next) => {
    const ctx = c.get('ctx')

    if (!ctx.tenantId) {
      return c.json(
        {
          code: 'FORBIDDEN',
          message: 'Missing tenant ID',
        },
        403,
      )
    }

    await next()
  })
