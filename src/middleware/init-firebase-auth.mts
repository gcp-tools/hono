import { createMiddleware } from 'hono/factory'
import { makeFirebaseAuthIOFn } from '../lib/make-firebase-auth-io.mjs'
import type { AuthContext, RequestWithContext } from '../lib/types.mjs'

export const initFirebaseAuth = <E,>() =>
  createMiddleware<{
    Variables: RequestWithContext<E> & AuthContext
  }>(async (c, next) => {
    const authFns = c.get('authFns')

    // Skip if no auth functions defined
    if (!authFns) {
      c.set('auth', {})
      await next()
      return
    }

    const ctx = c.get('ctx')
    const authClient = c.get('authClient')
    const logger = c.get('requestLogger')

    if (!authClient) {
      throw new Error('authClient not found in context')
    }

    // Wrap all auth functions with error handling and retry logic
    const auth = Object.fromEntries(
      Object.entries(authFns).map(([key, fn]) => [
        key,
        makeFirebaseAuthIOFn(fn(authClient, ctx, logger), logger),
      ]),
    )

    c.set('auth', auth)

    await next()
  })
