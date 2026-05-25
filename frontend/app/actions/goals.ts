'use server'

import { getServerToken } from '@/lib/supabase/getServerToken'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

async function apiFetch(endpoint: string, method: string, body?: any) {
  const token = await getServerToken()
  if (!token) throw new Error('Unauthorized - no token available')

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `API Error: ${response.status}`)
  }

  return response.json()
}

export async function setGoal(targetCount: number) {
  return apiFetch('/v1/goal', 'PUT', { target_count: targetCount })
}
