import type { AppError, Result } from './types.mjs'

/**
 * Unwraps a Result, returning the value if ok, or throwing the error
 * Use within try/catch blocks in command functions for clean error handling
 */
export const unwrap = <T,>(result: Result<T>): T => {
  if (!result.ok) {
    throw result.error
  }
  return result.value
}

/**
 * Unwraps a Result that may contain null, providing a custom error if null or not ok
 * Useful for "not found" scenarios where you want to return a specific error
 */
export const unwrapOr = <T,>(result: Result<T | null>, error: AppError): T => {
  if (!result.ok) {
    throw result.error
  }
  if (result.value === null) {
    throw error
  }
  return result.value
}

/**
 * Pattern matching for Result types
 * Provides a clean way to handle both success and error cases
 */
export const match = <T, U>(
  result: Result<T>,
  handlers: {
    ok: (value: T) => U
    err: (error: AppError) => U
  },
): U => {
  return result.ok ? handlers.ok(result.value) : handlers.err(result.error)
}

/**
 * Maps the value of a successful Result to a new value
 * If the Result is an error, returns the error unchanged
 */
export const mapResult = <T, U>(
  result: Result<T>,
  fn: (value: T) => U,
): Result<U> => {
  if (!result.ok) {
    return result
  }
  return { ok: true, value: fn(result.value) }
}

/**
 * Maps the error of a failed Result to a new error
 * If the Result is successful, returns the success unchanged
 */
export const mapError = <T,>(
  result: Result<T>,
  fn: (error: AppError) => AppError,
): Result<T> => {
  if (result.ok) {
    return result
  }
  return { ok: false, error: fn(result.error) }
}

/**
 * Chains Result-returning operations together
 * If the first Result is an error, returns that error
 * Otherwise, applies the function to the value
 */
export const flatMap = <T, U>(
  result: Result<T>,
  fn: (value: T) => Result<U>,
): Result<U> => {
  if (!result.ok) {
    return result
  }
  return fn(result.value)
}
