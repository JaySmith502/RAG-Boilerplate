const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * Custom error class for API errors with status code and detail message.
 * Normalizes error responses from the FastAPI backend.
 */
export class ApiError extends Error {
  status: number
  detail: string
  originalError?: unknown

  constructor(status: number, detail: string, originalError?: unknown) {
    super(detail)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
    this.originalError = originalError
  }

  /**
   * Check if error is a client error (4xx)
   */
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500
  }

  /**
   * Check if error is a server error (5xx)
   */
  isServerError(): boolean {
    return this.status >= 500
  }

  /**
   * Check if error is retryable (network error or 5xx)
   */
  isRetryable(): boolean {
    return this.status === 0 || this.isServerError()
  }
}

/**
 * Options for the API client
 */
interface ApiClientOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

/**
 * Typed fetch wrapper with error handling.
 * Automatically handles JSON serialization and error normalization.
 *
 * @param endpoint - API endpoint (without base URL), e.g., '/chat' or '/sessions/123'
 * @param options - Fetch options with typed body
 * @returns Promise resolving to typed response data
 * @throws ApiError on non-2xx responses or network errors
 *
 * @example
 * // GET request
 * const sessions = await apiClient<SessionsResponse>('/sessions')
 *
 * @example
 * // POST request
 * const response = await apiClient<ChatResponse>('/chat', {
 *   method: 'POST',
 *   body: { message: 'Hello', session_id: null }
 * })
 */
export async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const { body, headers, ...restOptions } = options
  const url = `${API_BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      let detail = 'Unknown error'
      try {
        const errorData = await response.json()
        // FastAPI returns errors as { detail: string } or { detail: [...] }
        if (typeof errorData.detail === 'string') {
          detail = errorData.detail
        } else if (Array.isArray(errorData.detail)) {
          // Validation errors come as array
          detail = errorData.detail.map((e: { msg: string }) => e.msg).join(', ')
        } else {
          detail = JSON.stringify(errorData)
        }
      } catch {
        detail = response.statusText || `HTTP ${response.status}`
      }
      throw new ApiError(response.status, detail)
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return undefined as T
    }

    return response.json()
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error
    }

    // Network errors (fetch failed)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(0, 'Network error: Unable to connect to server', error)
    }

    // Unknown errors
    throw new ApiError(0, 'An unexpected error occurred', error)
  }
}

/**
 * Helper to construct query strings from an object
 */
export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      searchParams.append(key, String(value))
    }
  }
  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}
