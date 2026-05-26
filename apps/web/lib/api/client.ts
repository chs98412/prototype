'use server'

import { getServerToken } from '@/lib/auth/getServerToken'
import { API_URL } from '@/lib/config'
import { ApiError, parseApiError, NetworkError } from './errors'
import { logger } from '@/lib/logger'

export interface ApiResponse<T> {
  data?: T
  error?: string
  success?: boolean
  count?: number
}

type ApiCallOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  token?: string
}

/**
 * 서버 컴포넌트용 API 호출 (토큰 자동 주입)
 * @throws ApiError - 4xx/5xx 응답
 * @throws NetworkError - 네트워크 오류
 */
export async function apiCall<T>(
  endpoint: string,
  options: ApiCallOptions = {}
): Promise<ApiResponse<T>> {
  const startTime = performance.now()
  const method = options.method || 'GET'

  try {
    let token = options.token
    if (!token) {
      token = await getServerToken()
    }

    if (!token) {
      throw new ApiError(401, 'NO_TOKEN', 'Unauthorized')
    }

    const url = `${API_URL}${endpoint}`
    const body = options.body ? JSON.stringify(options.body) : undefined

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body,
    })

    const duration = performance.now() - startTime

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const error = parseApiError(response.status, errorData)
      logger.logApiCall(method, endpoint, response.status, duration, error)
      return { error: error.message }
    }

    logger.logApiCall(method, endpoint, response.status, duration)
    const data = await response.json()
    return data
  } catch (error) {
    const duration = performance.now() - startTime
    logger.logApiCall(method, endpoint, 0, duration, error instanceof Error ? error : new Error(String(error)))

    if (error instanceof ApiError) {
      return { error: error.message }
    }
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * 클라이언트 컴포넌트용 API 호출 (쿠키 기반)
 * @throws ApiError - 4xx/5xx 응답
 * @throws NetworkError - 네트워크 오류
 */
export async function clientApiCall<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: unknown
    token: string
  }
): Promise<ApiResponse<T>> {
  const startTime = performance.now()
  const method = options.method || 'GET'

  try {
    const url = `${API_URL}${endpoint}`
    const body = options.body ? JSON.stringify(options.body) : undefined

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${options.token}`,
      },
      body,
    })

    const duration = performance.now() - startTime

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const error = parseApiError(response.status, errorData)
      logger.logApiCall(method, endpoint, response.status, duration, error)
      return { error: error.message }
    }

    logger.logApiCall(method, endpoint, response.status, duration)
    const data = await response.json()
    return data
  } catch (error) {
    const duration = performance.now() - startTime
    logger.logApiCall(method, endpoint, 0, duration, error instanceof Error ? error : new Error(String(error)))

    if (error instanceof ApiError) {
      return { error: error.message }
    }
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

