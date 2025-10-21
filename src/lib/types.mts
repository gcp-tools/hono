import type { Firestore } from '@google-cloud/firestore'
import type { Logger } from './logger.mjs'

// Application dependencies available in Hono context
export type BaseContext<E> = {
  readonly env: E
  readonly logger: Logger
  readonly db: Firestore
}

// Request context extracted from headers and JWT
export type RequestContext = {
  readonly correlationId: string
  readonly role: string
  readonly userId: string
}

// Extended context with request context
export type RequestWithContext<E> = BaseContext<E> & {
  readonly ctx: RequestContext
  readonly requestLogger: Logger
}

export type RepoContext = {
  // biome-ignore lint/suspicious/noExplicitAny: it doesn't care about the type at this juncture
  readonly repoFns: Record<string, FirestoreRepoFn<any, any>>
  // biome-ignore lint/suspicious/noExplicitAny: generic record of wrapped functions
  readonly repo: Record<string, (args: any) => Promise<Result<any>>>
}

export type ServicesContext = {
  // biome-ignore lint/suspicious/noExplicitAny: it doesn't care about the type at this juncture
  readonly serviceFns: Record<string, ServiceFn<any, any>>
  // biome-ignore lint/suspicious/noExplicitAny: generic record of wrapped functions
  readonly services: Record<string, (args: any) => Promise<Result<any>>>
}

export type CmdsContext = {
  // biome-ignore lint/suspicious/noExplicitAny: it doesn't care about the type at this juncture
  readonly cmdFns: Record<string, CommandFn<any, any, any, any>>
  // biome-ignore lint/suspicious/noExplicitAny: generic record of wrapped functions
  readonly cmds: Record<string, (args: any) => Promise<Result<any>>>
}

export type AppContext<E> = RequestWithContext<E> &
  RepoContext &
  ServicesContext &
  CmdsContext

// Unified Result type system
export type Result<T> = { ok: true; value: T } | { ok: false; error: AppError }

export type AppError = {
  code: 'NOT_FOUND' | 'CONFLICT' | 'SERVICE_UNAVAILABLE' | 'VALIDATION_ERROR'
  message: string
  cause?: Error | unknown
  data?: unknown
}

// Firestore repository functions
export type FirestoreRepoFn<A, R> = (
  db: Firestore,
  ctx: RequestContext,
  logger: Logger,
) => (args: A) => Promise<Result<R>>

// biome-ignore lint/suspicious/noExplicitAny: it doesn't care about the type at this juncture
export type WrappedFirestoreRepoFn<F extends FirestoreRepoFn<any, any>> =
  F extends FirestoreRepoFn<infer A, infer R>
    ? (args: A) => Promise<Result<R>>
    : never

// Service functions
export type ServiceFn<A, R> = (
  ctx: RequestContext,
  logger: Logger,
) => (args: A) => Promise<Result<R>>

// biome-ignore lint/suspicious/noExplicitAny: it doesn't care about the type at this juncture
export type WrappedServiceFn<F extends ServiceFn<any, any>> =
  F extends ServiceFn<infer A, infer R>
    ? (args: A) => Promise<Result<R>>
    : never

// Command functions
export type CommandFn<A, R, Re = null, Se = null> = (
  deps: { repo: Re; services: Se },
  ctx: RequestContext,
  logger: Logger,
) => (args: A) => Promise<Result<R>>

// biome-ignore lint/suspicious/noExplicitAny: it doesn't care about the type at this juncture
export type WrappedCommandFn<F extends CommandFn<any, any, any, any>> =
  // biome-ignore lint/suspicious/noExplicitAny: it doesn't care about the type at this juncture
  F extends CommandFn<infer A, infer R, any, any>
    ? (args: A) => Promise<Result<R>>
    : never

// HTTP Response discriminated union types
export type SuccessResponse<T> = {
  code: 'SUCCESS'
  data: T
}

export type NotFoundResponse = {
  code: 'NOT_FOUND'
  data: { message: string }
}

export type ConflictResponse = {
  code: 'CONFLICT'
  data: { message: string }
}

export type InternalServerErrorResponse = {
  code: 'INTERNAL_SERVER_ERROR'
  data: { message: string }
}

export type ServiceUnavailableResponse = {
  code: 'SERVICE_UNAVAILABLE'
  data: { message: string }
}

export type HttpResponse<T> =
  | SuccessResponse<T>
  | NotFoundResponse
  | ConflictResponse
  | InternalServerErrorResponse
  | ServiceUnavailableResponse
