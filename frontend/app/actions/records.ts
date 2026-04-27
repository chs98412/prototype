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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('user_records').upsert(
    {
      user_id: user.id,
      tmdb_id: data.tmdbId,
      media_type: data.mediaType,
      status: data.status,
      rating: data.status === 'watched' ? (data.rating ?? null) : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,tmdb_id,media_type' },
  )

  if (error) throw error
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
