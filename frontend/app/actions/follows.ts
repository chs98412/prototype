'use server'

import { getServerToken } from '@/lib/supabase/getServerToken'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://logged-backend.fly.dev'
    : 'http://localhost:8080')

async function apiFetch(endpoint: string, method: string) {
  const token = await getServerToken()
  if (!token) throw new Error('Unauthorized - no token available')

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `API Error: ${response.status}`)
  }

  return response.json()
}

export async function followUser(followingId: string) {
  return apiFetch(`/v1/follow/${followingId}`, 'POST')
}

export async function unfollowUser(followingId: string) {
  return apiFetch(`/v1/follow/${followingId}`, 'DELETE')
}
