import type { Firestore } from '@google-cloud/firestore'
import type { auth } from 'firebase-admin'
import type { Logger } from './logger.mjs'

export type Auth = auth.Auth
// Application dependencies available in Hono context
export type BaseContext<E> = {
  readonly env: E
  readonly logger: Logger
  readonly db: Firestore
  readonly authClient?: Auth
}

export type SimpleContext = {
  readonly correlationId: string
  readonly role: string
  readonly userId: string
}

export type TenantContext = SimpleContext & {
  readonly tenantId: string
}

export type RequestContext = TenantContext & {
  readonly organisationType?: string
}

// export type RequestContext = {
//   readonly correlationId: string
//   readonly role: string
//   readonly userId: string
//   readonly tenantId?: string
//   readonly organisationType?: string
// }

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

export type AuthContext = {
  // biome-ignore lint/suspicious/noExplicitAny: it doesn't care about the type at this juncture
  readonly authFns?: Record<string, FirebaseAuthFn<any, any>>
  // biome-ignore lint/suspicious/noExplicitAny: generic record of wrapped functions
  readonly auth?: Record<string, (args: any) => Promise<Result<any>>>
}

export type CmdsContext = {
  // biome-ignore lint/suspicious/noExplicitAny: it doesn't care about the type at this juncture
  readonly cmdFns: Record<string, CommandFn<any, any, any, any, any>>
  // biome-ignore lint/suspicious/noExplicitAny: generic record of wrapped functions
  readonly cmds: Record<string, (args: any) => Promise<Result<any>>>
}

export type AppContext<E> = RequestWithContext<E> &
  RepoContext &
  ServicesContext &
  AuthContext &
  CmdsContext

// Unified Result type system
export type Ok<T> = { ok: true; value: T }
export type Err = { ok: false; error: AppError }
export type Result<T> = Ok<T> | Err

export type AppError = {
  code:
    | 'NOT_FOUND'
    | 'CONFLICT'
    | 'SERVICE_UNAVAILABLE'
    | 'VALIDATION_ERROR'
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
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
) => (args: A) => Promise<R>

// biome-ignore lint/suspicious/noExplicitAny: it doesn't care about the type at this juncture
export type WrappedServiceFn<F extends ServiceFn<any, any>> =
  F extends ServiceFn<infer A, infer R>
    ? (args: A) => Promise<Result<R>>
    : never

// Firebase Auth functions
export type FirebaseAuthFn<A, R> = (
  auth: Auth,
  ctx: RequestContext,
  logger: Logger,
) => (args: A) => Promise<Result<R>>

// biome-ignore lint/suspicious/noExplicitAny: it doesn't care about the type at this juncture
export type WrappedFirebaseAuthFn<F extends FirebaseAuthFn<any, any>> =
  F extends FirebaseAuthFn<infer A, infer R>
    ? (args: A) => Promise<Result<R>>
    : never

// Command functions
export type CommandFn<A, R, Re = null, Se = null, Au = null> = (
  deps: { repo: Re; services: Se; auth: Au },
  ctx: RequestContext,
  logger: Logger,
) => (args: A) => Promise<Result<R>>

// biome-ignore lint/suspicious/noExplicitAny: it doesn't care about the type at this juncture
export type WrappedCommandFn<F extends CommandFn<any, any, any, any, any>> =
  // biome-ignore lint/suspicious/noExplicitAny: it doesn't care about the type at this juncture
  F extends CommandFn<infer A, infer R, any, any, any>
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
