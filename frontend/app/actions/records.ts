'use server'

import { getServerToken } from '@/lib/supabase/getServerToken'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://logged-backend.fly.dev'
    : 'http://localhost:8080')

export type RecordStatus = 'watched' | 'watching' | 'want'

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

export async function upsertRecord(data: {
  tmdbId: number
  mediaType: 'movie' | 'tv'
  status: RecordStatus
  rating?: number
  title?: string
  posterPath?: string
  genreIds?: number[]
}) {
  await apiFetch('/v1/records', 'POST', {
    tmdb_id: data.tmdbId,
    media_type: data.mediaType,
    status: data.status,
    rating: data.status === 'watched' ? (data.rating ?? null) : null,
  })

  // Log streak and update challenges when watched
  if (data.status === 'watched') {
    await Promise.allSettled([
      apiFetch('/v1/streaks/log', 'POST'),
      apiFetch('/v1/challenges/progress', 'POST', {
        tmdb_id: data.tmdbId,
        delta: 1,
      }),
    ]).catch(() => {})
  }
}

export async function deleteRecord(data: {
  tmdbId: number
  mediaType: 'movie' | 'tv'
}) {
  await apiFetch(`/v1/records/tmdb/${data.tmdbId}`, 'DELETE')

  // Update challenge progress
  await apiFetch('/v1/challenges/progress', 'POST', {
    tmdb_id: data.tmdbId,
    delta: -1,
  }).catch(() => {})
}
