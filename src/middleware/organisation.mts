import { createMiddleware } from 'hono/factory'
import type { RequestContext } from '../lib/types.mjs'

export const organisationType = (organisationTypes: string[]) =>
  createMiddleware<{ Variables: { ctx: RequestContext } }>(async (c, next) => {
    const ctx = c.get('ctx')
    if (
      !ctx.organisationType ||
      !organisationTypes.includes(ctx.organisationType)
    ) {
      return c.json({ error: 'Organisation type not supported' }, 400)
    }
    await next()
  })
