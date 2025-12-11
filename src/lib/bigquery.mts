import { BigQuery } from '@google-cloud/bigquery'

export type BigQueryClient = BigQuery

export type BigQueryConfig = {
  projectId: string
  keyFilename?: string
  credentials?: { client_email?: string; private_key?: string }
  [key: string]: unknown
}

export const createBigQuery = (config: BigQueryConfig): BigQueryClient => {
  return new BigQuery(config)
}
