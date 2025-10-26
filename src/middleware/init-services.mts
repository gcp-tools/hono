import { createMiddleware } from 'hono/factory'
import { makeServiceIOFn } from '../lib/make-service-io.mjs'
import type { RequestWithContext, ServicesContext } from '../lib/types.mjs'

export const initServices = <E,>() =>
  createMiddleware<{
    Variables: RequestWithContext<E> & ServicesContext
  }>(async (c, next) => {
    const serviceFns = c.get('serviceFns')

    // Skip if no services functions defined
    if (!serviceFns) {
      c.set('services', {})
      await next()
      return
    }

    const ctx = c.get('ctx')
    const logger = c.get('logger')

    const services = Object.fromEntries(
      Object.entries(serviceFns).map(([key, fn]) => [
        key,
        makeServiceIOFn(fn(ctx, logger), logger),
      ]),
    )

    c.set('services', services)

    await next()
  })
