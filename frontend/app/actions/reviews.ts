'use server'

import { createClient } from '@/lib/supabase/server'

export async function upsertReview(data: {
  tmdbId: number
  mediaType: 'movie' | 'tv'
  content: string
  isSpoiler: boolean
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Unauthorized')

  const { error } = await supabase.from('reviews').upsert(
    {
      user_id: session.user.id,
      tmdb_id: data.tmdbId,
      media_type: data.mediaType,
      content: data.content,
      is_spoiler: data.isSpoiler,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,tmdb_id,media_type' },
  )
  if (error) throw error
}

export async function deleteReview(data: {
  tmdbId: number
  mediaType: 'movie' | 'tv'
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('reviews')
    .delete()
    .match({ user_id: session.user.id, tmdb_id: data.tmdbId, media_type: data.mediaType })
  if (error) throw error
}
