import { createMiddleware } from 'hono/factory'
import type { AppContext } from '../lib/types.mjs'

export const initCommands = <E,>() =>
  createMiddleware<{
    Variables: AppContext<E>
  }>(async (c, next) => {
    const ctx = c.get('ctx')
    const logger = c.get('logger')
    const repo = c.get('repo')
    const services = c.get('services')
    const auth = c.get('auth')
    const cmdFns = c.get('cmdFns')

    const cmds = Object.fromEntries(
      Object.entries(cmdFns).map(([key, fn]) => [
        key,
        fn({ repo, services, auth }, ctx, logger),
      ]),
    )

    c.set('cmds', cmds)

    await next()
  })
