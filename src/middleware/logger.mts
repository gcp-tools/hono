import { createMiddleware } from 'hono/factory'
import type { Logger } from '../lib/logger.mjs'
import { createChildLogger } from '../lib/logger.mjs'
import type { RequestContext } from '../lib/types.mjs'

export const requestContextLogger = createMiddleware<{
  Variables: {
    ctx: RequestContext
    logger: Logger
    requestLogger: Logger
  }
}>(async (c, next) => {
  const logger = c.get('logger')
  const ctx = c.get('ctx')

  const requestLogger = createChildLogger(logger, {
    correlationId: ctx.correlationId,
    method: c.req.method,
    path: c.req.path,
    role: ctx.role,
    userId: ctx.userId,
    tenantId: ctx.tenantId,
    organisationType: ctx.organisationType,
  })

  c.set('requestLogger', requestLogger)

  requestLogger.info('[request] start')
  await next()
  requestLogger.info('[request] end')
})

export const requestLogger = createMiddleware<{
  Variables: {
    logger: Logger
    requestLogger: Logger
  }
}>(async (c, next) => {
  const logger = c.get('logger')

  const requestLogger = createChildLogger(logger, {
    method: c.req.method,
    path: c.req.path,
  })

  c.set('requestLogger', requestLogger)

  requestLogger.info('[request] start')
  await next()
  requestLogger.info('[request] end')
})
