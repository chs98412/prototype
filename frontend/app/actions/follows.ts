'use server'

import { createClient } from '@/lib/supabase/server'

export async function followUser(followingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase.from('user_follows').insert({ follower_id: user.id, following_id: followingId })
}

export async function unfollowUser(followingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase.from('user_follows').delete().match({ follower_id: user.id, following_id: followingId })
}
