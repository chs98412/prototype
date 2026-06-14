import { getToken, setToken, clearToken } from './auth'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
let isRefreshing = false
const refreshSubscribers: Array<(token: string) => void> = []

async function refreshToken(): Promise<string | null> {
  if (isRefreshing) return null

  isRefreshing = true
  const token = getToken()
  if (!token) {
    isRefreshing = false
    return null
  }

  try {
    const res = await fetch(`${BASE_URL}/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!res.ok) throw new Error('refresh failed')

    const data = await res.json() as { access_token: string }
    const newToken = data.access_token
    setToken(newToken)

    refreshSubscribers.forEach(cb => cb(newToken))
    refreshSubscribers.length = 0

    isRefreshing = false
    return newToken
  } catch {
    isRefreshing = false
    clearToken()
    window.location.href = '/login'
    return null
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers })

  // Handle 401 Unauthorized — try to refresh token
  if (res.status === 401) {
    const newToken = await refreshToken()
    if (newToken) {
      // Retry request with new token
      headers['Authorization'] = `Bearer ${newToken}`
      const retryRes = await fetch(`${BASE_URL}${path}`, { ...init, headers })
      if (!retryRes.ok) {
        const err = await retryRes.json().catch(() => ({ error: retryRes.statusText }))
        throw new Error(err.error ?? retryRes.statusText)
      }
      return retryRes.json()
    }
    throw new Error('token expired')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? res.statusText)
  }
  return res.json()
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
