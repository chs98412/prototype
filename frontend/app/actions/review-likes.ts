'use server'
import { checkReviewLike, likeReview, unlikeReview } from '@/lib/api/client'

export async function toggleReviewLike(reviewId: string, token: string) {
  const checkResponse = await checkReviewLike(reviewId, token)
  const isLiked = checkResponse.data?.liked || false

  if (isLiked) {
    const response = await unlikeReview(reviewId)
    if (response.error) throw new Error(response.error)
    return false
  } else {
    const response = await likeReview(reviewId)
    if (response.error) throw new Error(response.error)
    return true
  }
}
