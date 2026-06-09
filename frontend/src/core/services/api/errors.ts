/**
 * API Error Class
 * Standardized error handling for all API communication
 */

export interface ApiErrorOptions {
  code: string
  message: string
  statusCode: number
  details?: Record<string, any>
}

export class ApiError extends Error {
  code: string
  statusCode: number
  details?: Record<string, any>

  constructor(options: ApiErrorOptions) {
    super(options.message)
    this.name = 'ApiError'
    this.code = options.code
    this.statusCode = options.statusCode
    this.details = options.details

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, ApiError.prototype)
  }

  /**
   * Check if this is a specific error code
   */
  isCode(code: string): boolean {
    return this.code === code
  }

  /**
   * Get field-level validation errors
   * Assumes details.fields = { fieldName: 'error message' }
   */
  getFieldErrors(): Record<string, string> {
    if (this.code === 'VALIDATION_ERROR' && this.details?.fields) {
      return this.details.fields
    }
    return {}
  }

  /**
   * User-friendly error message for UI
   */
  getUserMessage(): string {
    const errorMessages: Record<string, string> = {
      NETWORK_ERROR: 'Unable to connect to server. Check your internet connection.',
      UNAUTHORIZED: 'Your session has expired. Please login again.',
      FORBIDDEN: 'You do not have permission to perform this action.',
      NOT_FOUND: 'The requested resource was not found.',
      VALIDATION_ERROR: 'Please check your input and try again.',
      RATE_LIMIT: 'Too many requests. Please wait a moment before trying again.',
      INTERNAL_ERROR: 'Something went wrong on the server. Please try again later.',
    }

    return errorMessages[this.code] || this.message
  }

  /**
   * For logging/debugging
   */
  toString(): string {
    return `[${this.code}] ${this.message} (HTTP ${this.statusCode})`
  }

  /**
   * Convert to JSON for logging
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    }
  }
}

/**
 * Type guard to check if error is ApiError
 */
export function isApiError(error: any): error is ApiError {
  return error instanceof ApiError
}
