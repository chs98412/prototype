'use server'

import { createRecord, deleteRecord as deleteRecordApi } from '@/lib/api/client'

export type RecordStatus = 'watched' | 'watching' | 'want'

export async function upsertRecord(data: {
  tmdbId: number
  mediaType?: 'movie' | 'tv'
  status?: RecordStatus
  rating?: number
  title?: string
  posterPath?: string
  genreIds?: number[]
}) {
  const response = await createRecord({
    tmdb_id: data.tmdbId,
    record_type: data.mediaType ?? 'movie',
    rating: data.rating ?? 0,
  })

  if (response.error) throw new Error(response.error)
}

export async function deleteRecord(data: { tmdbId: number }) {
  const response = await deleteRecordApi(data.tmdbId)
  if (response.error) throw new Error(response.error)
}
