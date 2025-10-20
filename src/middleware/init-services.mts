import { createMiddleware } from 'hono/factory'
import { makeServiceIOFn } from '../lib/make-service-io.mjs'
import type { RequestWithContext, ServicesContext } from '../lib/types.mjs'

export const initServices = <E,>() =>
  createMiddleware<{
    Variables: RequestWithContext<E> & ServicesContext
  }>(async (c, next) => {
    const ctx = c.get('ctx')
    const logger = c.get('logger')
    const serviceFns = c.get('serviceFns')

    const services = Object.fromEntries(
      Object.entries(serviceFns).map(([key, fn]) => [
        key,
        makeServiceIOFn(fn(ctx, logger), logger),
      ]),
    )

    c.set('services', services)

    await next()
  })
