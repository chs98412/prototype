'use server'
import { likeReview, unlikeReview } from '@/lib/api/client'
import { createClient } from '@/lib/supabase/server'

export async function toggleReviewLike(reviewId: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) throw new Error('Unauthorized')

  // Check current state
  const { data: likes } = await supabase
    .from('review_likes')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('review_id', reviewId)
    .maybeSingle()

  const isLiked = !!likes

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
