'use server'
import { likeReview, unlikeReview, checkReviewLike } from '@/lib/api/client'
import { createClient } from '@/lib/supabase/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export async function toggleReviewLike(reviewId: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) throw new Error('Unauthorized')

  // Check current state via API
  const checkResponse = await checkReviewLike(reviewId, session.access_token)
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
