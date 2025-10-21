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
  readonly repo: Record<string, unknown>
}

export type ServicesContext = {
  // biome-ignore lint/suspicious/noExplicitAny: it doesn't care about the type at this juncture
  readonly serviceFns: Record<string, ServiceFn<any, any>>
  readonly services: Record<string, unknown>
}

export type CmdsContext = {
  // biome-ignore lint/suspicious/noExplicitAny: it doesn't care about the type at this juncture
  readonly cmdFns: Record<string, CommandFn<any, any, any, any>>
  readonly cmds: Record<string, unknown>
}

export type AppContext<E> = RequestWithContext<E> &
  RepoContext &
  ServicesContext &
  CmdsContext

// Error types
export type BaseError = {
  cause?: Error | unknown
  data?: unknown
  message: string
}

export type ConflictError = BaseError & {
  code: 'CONFLICT'
}

export type NotFoundError = BaseError & {
  code: 'NOT_FOUND'
}

export type ValidationError = BaseError & {
  code: 'VALIDATION_ERROR'
}

export type ServiceUnavailableError = BaseError & {
  code: 'SERVICE_UNAVAILABLE'
}

// IO functions
export type IOError = ServiceUnavailableError | ValidationError
export type IOSuccess<R> = {
  code: 'IO_SUCCESS'
  data: R
}

export type IOResponse<R> = IOError | IOSuccess<R>

export type IOFn<A, R> = (args: A) => Promise<R>
export type RunIOFn<A, R> = (args: A) => Promise<R>

// Firestore repository functions
export type MakeFirestoreIoFn = <A, R>(
  fn: IOFn<A, R>,
  logger: Logger,
) => RunIOFn<A, IOResponse<R>>

export type FirestoreRepoFn<A, R> = (
  db: Firestore,
  ctx: RequestContext,
  logger: Logger,
) => IOFn<A, R>

// biome-ignore lint/suspicious/noExplicitAny: it doesn't care about the type at this juncture
export type WrappedFirestoreRepoFn<F extends FirestoreRepoFn<any, any>> = (
  args: Parameters<ReturnType<F>>[0],
) => Promise<IOResponse<Awaited<ReturnType<ReturnType<F>>>>>

// Service functions
export type MakeServiceIoFn = <A, R>(
  fn: IOFn<A, R>,
  logger: Logger,
) => RunIOFn<A, IOResponse<R>>

export type ServiceFn<A, R> = (
  ctx: RequestContext,
  logger: Logger,
) => IOFn<A, R>

// biome-ignore lint/suspicious/noExplicitAny: it doesn't care about the type at this juncture
export type WrappedServiceFn<F extends ServiceFn<any, any>> = (
  args: Parameters<ReturnType<F>>[0],
) => Promise<IOResponse<Awaited<ReturnType<ReturnType<F>>>>>

// Command functions
export type CmdError =
  | NotFoundError
  | ValidationError
  | ConflictError
  | ServiceUnavailableError
export type CmdSuccess<R> = {
  code: 'CMD_SUCCESS'
  data: R
}
export type CmdResponse<R> = CmdError | CmdSuccess<R>

export type CmdFn<A, R> = (args: A) => Promise<CmdResponse<R>>
export type CommandFn<A, R, Re = null, Se = null> = (
  deps: { repo: Re; services: Se },
  ctx: RequestContext,
  logger: Logger,
) => CmdFn<A, R>

// biome-ignore lint/suspicious/noExplicitAny: it doesn't care about the type at this juncture
export type WrappedCommandFn<F extends CommandFn<any, any, any, any>> = (
  args: Parameters<ReturnType<F>>[0],
) => Promise<Awaited<ReturnType<ReturnType<F>>>>

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
