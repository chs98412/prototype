'use server'
import { likeReview, unlikeReview, checkReviewLike } from '@/lib/api/reviews'
import { getServerToken } from '@/lib/auth/getServerToken'

export async function toggleReviewLike(reviewId: string) {
  const token = await getServerToken()

  if (!token) throw new Error('Unauthorized')

  // Check current state via API
  const checkResponse = await checkReviewLike(reviewId, token)
  const isLiked = checkResponse.data?.liked ?? false

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
