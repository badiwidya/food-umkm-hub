import type { ErrorResponse, ValidationErrorResponse } from '../../../client'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isErrorResponse(value: unknown): value is ErrorResponse {
  return isRecord(value) && typeof value.message === 'string'
}

function isValidationErrorResponse(
  value: unknown,
): value is ValidationErrorResponse {
  return isRecord(value) && Array.isArray(value.errors)
}

export function getCheckoutErrorMessage(error: unknown, fallback: string) {
  if (isErrorResponse(error)) {
    return error.message
  }

  if (isValidationErrorResponse(error)) {
    const firstIssue = error.errors[0]

    if (firstIssue?.message) {
      return firstIssue.message
    }
  }

  return fallback
}
