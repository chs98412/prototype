'use server'

import { createClient } from '@/lib/supabase/server'

export type RecordStatus = 'watched' | 'watching' | 'want'

export async function upsertRecord(data: {
  tmdbId: number
  mediaType: 'movie' | 'tv'
  status: RecordStatus
  rating?: number
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
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,tmdb_id,media_type' },
  )

  if (error) throw error

  // 스트릭 업데이트 — "봄" 상태일 때만 카운트
  if (data.status === 'watched') {
    const apiUrl = process.env.API_URL
    if (apiUrl) {
      await fetch(`${apiUrl}/v1/streaks/log`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      }).catch(() => { /* 스트릭 실패가 기록 저장을 막지 않음 */ })
    }
  }
}

export async function deleteRecord(data: {
  tmdbId: number
  mediaType: 'movie' | 'tv'
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('user_records')
    .delete()
    .match({ user_id: user.id, tmdb_id: data.tmdbId, media_type: data.mediaType })

  if (error) throw error
}
