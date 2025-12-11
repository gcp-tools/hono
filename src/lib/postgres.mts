import { Pool, neon } from '@neondatabase/serverless'
import { drizzle as drizzleNeonHttp } from 'drizzle-orm/neon-http'
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http'
import { drizzle as drizzleNeonServerless } from 'drizzle-orm/neon-serverless'
import type { NeonDatabase } from 'drizzle-orm/neon-serverless'
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

export type PostgresClient =
  | {
      query: NeonHttpDatabase
      transaction: NeonDatabase
    }
  | {
      query: PostgresJsDatabase
      transaction: PostgresJsDatabase
    }

const isTestMode = () => process.env.INTEGRATION_TEST === 'true'

export const createPostgres = (connectionString: string): PostgresClient => {
  if (isTestMode()) {
    const db = drizzlePostgres(postgres(connectionString))
    return { query: db, transaction: db }
  }

  return {
    query: drizzleNeonHttp(neon(connectionString)),
    transaction: drizzleNeonServerless(new Pool({ connectionString })),
  }
}
