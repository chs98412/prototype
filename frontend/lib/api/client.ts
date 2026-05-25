'use server'

import { getServerToken } from '@/lib/auth/getServerToken'
import { API_URL } from '@/lib/config'

export interface ApiResponse<T> {
  data?: T
  error?: string
  success?: boolean
  count?: number
}

export async function apiCall<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: any
    token?: string
  } = {}
): Promise<ApiResponse<T>> {
  try {
    let token = options.token
    if (!token) {
      token = await getServerToken()
    }

    if (!token) {
      return { error: 'Unauthorized' }
    }

    const url = `${API_URL}${endpoint}`
    const method = options.method || 'GET'
    const body = options.body ? JSON.stringify(options.body) : undefined

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        error: errorData.error || `API Error: ${response.status}`,
      }
    }

    const data = await response.json()
    return data
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function clientApiCall<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: any
    token: string
  }
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_URL}${endpoint}`
    const method = options.method || 'GET'
    const body = options.body ? JSON.stringify(options.body) : undefined

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${options.token}`,
      },
      body,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        error: errorData.error || `API Error: ${response.status}`,
      }
    }

    const data = await response.json()
    return data
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

