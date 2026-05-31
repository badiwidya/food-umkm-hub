import type { ErrorResponse, ValidationErrorResponse } from '../../../client'
import {
  zErrorResponse,
  zValidationErrorResponse,
} from '../../../client/zod.gen'

type BackendErrorInfo = {
  message: string
  type: string | null
}

const DUPLICATE_ACCOUNT_ERROR_TYPES = ['email_taken', 'phone_taken'] as const

export function getBackendErrorInfo(error: unknown): BackendErrorInfo | null {
  const errorResult = zErrorResponse.safeParse(error)

  if (errorResult.success) {
    const errorResponse: ErrorResponse = errorResult.data

    return {
      message: errorResponse.message,
      type: errorResponse.type,
    }
  }

  const validationResult = zValidationErrorResponse.safeParse(error)

  if (validationResult.success) {
    const validationErrorResponse: ValidationErrorResponse =
      validationResult.data

    return {
      message:
        validationErrorResponse.errors[0]?.message ??
        validationErrorResponse.message,
      type: validationErrorResponse.type ?? 'validation_error',
    }
  }

  return null
}

export function getBackendErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  return getBackendErrorInfo(error)?.message ?? fallbackMessage
}

export function shouldReturnToRegisterAccountStep(errorType: string | null) {
  return DUPLICATE_ACCOUNT_ERROR_TYPES.some((type) => type === errorType)
}
