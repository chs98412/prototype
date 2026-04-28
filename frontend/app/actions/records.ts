'use server'

import { createClient } from '@/lib/supabase/server'

export type RecordStatus = 'watched' | 'watching' | 'want'

export async function upsertRecord(data: {
  tmdbId: number
  mediaType: 'movie' | 'tv'
  status: RecordStatus
  rating?: number
  title?: string
  posterPath?: string
  genreIds?: number[]
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Unauthorized')

  const { error } = await supabase.from('user_records').upsert(
    {
      user_id: session.user.id,
      tmdb_id: data.tmdbId,
      media_type: data.mediaType,
      status: data.status,
      rating: data.status === 'watched' ? (data.rating ?? null) : null,
      title: data.title ?? null,
      poster_path: data.posterPath ?? null,
      genre_ids: data.genreIds ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,tmdb_id,media_type' },
  )

  if (error) throw error

  // "봄" 상태일 때만 스트릭·도전과제 업데이트 (비동기, 실패해도 기록 저장은 유지)
  if (data.status === 'watched') {
    const apiUrl = process.env.API_URL
    if (apiUrl) {
      const headers = { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' }
      await Promise.allSettled([
        fetch(`${apiUrl}/v1/streaks/log`, { method: 'POST', headers }),
        fetch(`${apiUrl}/v1/challenges/progress`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ tmdb_id: data.tmdbId, delta: 1 }),
        }),
      ])
    }
  }
}

export async function deleteRecord(data: {
  tmdbId: number
  mediaType: 'movie' | 'tv'
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('user_records')
    .delete()
    .match({ user_id: session.user.id, tmdb_id: data.tmdbId, media_type: data.mediaType })

  if (error) throw error

  // 도전과제 진척도 -1
  const apiUrl = process.env.API_URL
  if (apiUrl) {
    await fetch(`${apiUrl}/v1/challenges/progress`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ tmdb_id: data.tmdbId, delta: -1 }),
    }).catch(() => {})
  }
}
