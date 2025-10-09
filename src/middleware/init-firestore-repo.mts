import { createMiddleware } from 'hono/factory'
import { makeFirestoreIOFn } from '../lib/make-firestore-io.mjs'
import type { RepoContext, RequestWithContext } from '../lib/types.mjs'

export const initFirestoreRepo = <E,>() =>
  createMiddleware<{
    Variables: RequestWithContext<E> & RepoContext
  }>(async (c, next) => {
    const ctx = c.get('ctx')
    const db = c.get('db')
    const logger = c.get('logger')
    const repoFns = c.get('repoFns')

    const repo = Object.fromEntries(
      Object.entries(repoFns).map(([key, fn]) => [
        key,
        makeFirestoreIOFn(fn(db, ctx, logger), logger),
      ]),
    )

    c.set('repo', repo)

    await next()
  })
