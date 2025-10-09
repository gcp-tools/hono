import { randomUUID } from 'node:crypto'
import { createMiddleware } from 'hono/factory'
import { z } from 'zod'
import type { RequestContext } from '../lib/types.mjs'

const USERINFO_HEADERS = [
  'x-apigateway-api-userinfo',
  'x-endpoint-api-userinfo',
] as const

const CORR_HEADERS = ['x-correlation-id', 'x-request-id'] as const

const firstHeader = (
  headers: Record<string, string | string[] | undefined>,
  names: readonly string[],
): string | undefined => {
  for (const name of names) {
    const value = headers[name]
    if (typeof value === 'string' && value.length > 0) return value
    if (Array.isArray(value) && value.length > 0) return value[0]
  }
  return undefined
}

const claimsSchema = z.object({
  claims: z.object({
    user_id: z.string(),
    sub: z.string(),
    role: z.string(),
  }),
})

const decodeClaims = (
  headers: Record<string, string | string[] | undefined>,
) => {
  const enc = firstHeader(headers, USERINFO_HEADERS)
  if (!enc) {
    return {
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Missing auth header' },
    } as const
  }

  try {
    const json = Buffer.from(enc, 'base64url').toString('utf8')
    const parsed = claimsSchema.parse(JSON.parse(json))
    return { success: true, data: parsed.claims } as const
  } catch (_error) {
    return {
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid auth header' },
    } as const
  }
}

export const context = createMiddleware<{
  Variables: { ctx: RequestContext }
}>(async (c, next) => {
  const headers = c.req.header()
  const claimsResult = decodeClaims(headers)

  if (!claimsResult.success) {
    return c.json(claimsResult.error, 401)
  }

  const correlationId = firstHeader(headers, CORR_HEADERS) || randomUUID()

  const ctx: RequestContext = {
    correlationId,
    role: claimsResult.data.role,
    userId: claimsResult.data.user_id,
  }

  c.set('ctx', ctx)
  await next()
})
