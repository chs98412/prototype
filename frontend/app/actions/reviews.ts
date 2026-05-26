'use server'

import { getServerToken } from '@/lib/supabase/getServerToken'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://logged-backend.fly.dev'
    : 'http://localhost:8080')

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

export async function upsertReview(data: {
  tmdbId: number
  mediaType: 'movie' | 'tv'
  content: string
  isSpoiler: boolean
}) {
  return apiFetch('/v1/reviews', 'POST', {
    tmdb_id: data.tmdbId,
    content: data.content,
    is_spoiler: data.isSpoiler,
  })
}

export async function deleteReview(data: {
  tmdbId: number
  mediaType: 'movie' | 'tv'
}) {
  // Fetch the review first to get its ID, then delete it
  const reviewsRes = await apiFetch(`/v1/reviews?limit=100&offset=0`, 'GET')
  const reviews = reviewsRes.data || []
  const review = reviews.find((r: any) => r.tmdb_id === data.tmdbId)

  if (review) {
    return apiFetch(`/v1/reviews/${review.id}`, 'DELETE')
  }

  throw new Error('Review not found')
}
