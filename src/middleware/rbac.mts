import { createMiddleware } from 'hono/factory'
import type { RequestContext } from '../lib/types.mjs'

export const requireRole = (roles: string[]) =>
  createMiddleware<{
    Variables: { ctx: RequestContext }
  }>(async (c, next) => {
    const { role } = c.get('ctx')

    if (!roles.includes(role)) {
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

type OrganisationAndRoleRequirement = {
  role: string
  organisationType: string[]
}

export const requireOrgAndRole = (
  requirements: OrganisationAndRoleRequirement[],
) =>
  createMiddleware<{
    Variables: { ctx: RequestContext }
  }>(async (c, next) => {
    const { organisationType, role } = c.get('ctx')

    const hasPermission = requirements.some(
      (r) => r.role === role && r.organisationType.includes(organisationType),
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
