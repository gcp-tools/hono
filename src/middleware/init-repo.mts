import { createMiddleware } from 'hono/factory'
import { makeBigQueryIOFn } from '../lib/make-bigquery-io.mjs'
import { makeFirestoreIOFn } from '../lib/make-firestore-io.mjs'
import { makePostgresIOFn } from '../lib/make-postgres-io.mjs'
import type { RepoContext, RequestWithContext } from '../lib/types.mjs'

export const initRepo = <E,>() =>
  createMiddleware<{
    Variables: RequestWithContext<E> & RepoContext
  }>(async (c, next) => {
    const repoFns = c.get('repoFns')

    // Skip if no repo functions defined
    if (!repoFns) {
      c.set('repo', {})
      await next()
      return
    }

    const ctx = c.get('ctx')
    const db = c.get('db')
    const logger = c.get('requestLogger')

    const repo = Object.fromEntries(
      Object.entries(repoFns).map(([key, repoFn]) => {
        switch (repoFn.dbType) {
          case 'firestore': {
            const firestoreDb = db.firestore
            if (!firestoreDb) {
              throw new Error(
                `Firestore client not found in context for repo function: ${key}`,
              )
            }
            return [
              key,
              makeFirestoreIOFn(repoFn.fn(firestoreDb, ctx, logger), logger),
            ]
          }
          case 'postgres': {
            const postgresClients = db.postgres
            if (!postgresClients) {
              throw new Error(
                `Postgres client not found in context for repo function: ${key}`,
              )
            }

            // Use transaction adapter if specified, otherwise default to query
            const useTransaction = repoFn.adapter === 'transaction'
            const postgresDb = useTransaction
              ? postgresClients.transaction
              : postgresClients.query

            return [
              key,
              makePostgresIOFn(repoFn.fn(postgresDb, ctx, logger), logger),
            ]
          }
          case 'bigquery': {
            const bigqueryDb = db.bigquery
            if (!bigqueryDb) {
              throw new Error(
                `BigQuery client not found in context for repo function: ${key}`,
              )
            }
            return [
              key,
              makeBigQueryIOFn(repoFn.fn(bigqueryDb, ctx, logger), logger),
            ]
          }
          default: {
            // TypeScript exhaustiveness check
            throw new Error(`Unknown database type for repo function: ${key}`)
          }
        }
      }),
    )

    c.set('repo', repo)

    await next()
  })
