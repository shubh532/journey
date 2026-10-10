import axios from 'axios'

type ErrorBody = {
  code?: string
  message?: string
  fieldErrors?: Record<string, string>
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fieldErrors?: Record<string, string>

  constructor(
    status: number,
    code: string,
    message: string,
    fieldErrors?: Record<string, string>,
  ) {
    super(message)
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (axios.isAxiosError<ErrorBody>(error)) {
    const status = error.response?.status ?? 0
    const body = error.response?.data
    return new ApiError(
      status,
      body?.code ?? (status === 0 ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR'),
      body?.message ?? 'Something went wrong. Please try again.',
      body?.fieldErrors,
    )
  }

  return new ApiError(0, 'UNKNOWN_ERROR', 'Something went wrong. Please try again.')
}
