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
    title: data.title || 'Untitled Review',
    content: data.content,
    spoiler: data.spoiler ?? false,
    rating: data.rating ?? 0,
  })
  if (response.error) throw new Error(response.error)
}

export async function deleteReview(data: { reviewId: string } | { tmdbId: number; mediaType: 'movie' | 'tv' }) {
  const reviewId = 'reviewId' in data ? data.reviewId : undefined
  if (!reviewId) throw new Error('Review ID is required')

  const response = await deleteReviewApi(reviewId)
  if (response.error) throw new Error(response.error)
}
