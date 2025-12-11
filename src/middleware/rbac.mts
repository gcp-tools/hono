import { createMiddleware } from 'hono/factory'
import type { RequestContext } from '../lib/types.mjs'

type RoleRequirement = {
  role: string
  organisationType: string
}

export const requires = (requirements: RoleRequirement[]) =>
  createMiddleware<{
    Variables: { ctx: RequestContext }
  }>(async (c, next) => {
    const { organisationType, role } = c.get('ctx')

    const hasPermission = requirements.some(
      (r) => r.role === role && r.organisationType === organisationType,
    )

    if (!hasPermission) {
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
