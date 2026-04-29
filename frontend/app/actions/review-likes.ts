'use server'
import { createClient } from '@/lib/supabase/server'

export async function toggleReviewLike(reviewId: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return false
  const { data: existing } = await supabase
    .from('review_likes')
    .select('user_id')
    .eq('user_id', session.user.id)
    .eq('review_id', reviewId)
    .maybeSingle()
  if (existing) {
    await supabase.from('review_likes').delete().match({ user_id: session.user.id, review_id: reviewId })
    return false
  } else {
    await supabase.from('review_likes').insert({ user_id: session.user.id, review_id: reviewId })
    return true
  }
}
