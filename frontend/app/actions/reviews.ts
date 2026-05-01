'use server'

import { createReview as createReviewApi, deleteReview as deleteReviewApi } from '@/lib/api/client'

export async function upsertReview(data: {
  tmdbId: number
  title?: string
  content: string
  spoiler?: boolean
  rating?: number
}) {
  const response = await createReviewApi({
    tmdb_id: data.tmdbId,
    title: data.title || '',
    content: data.content,
    spoiler: data.spoiler ?? false,
    rating: data.rating,
  })
  if (response.error) throw new Error(response.error)
}

export async function deleteReview(data: { reviewId: string }) {
  const response = await deleteReviewApi(data.reviewId)
  if (response.error) throw new Error(response.error)
}
