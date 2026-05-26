'use server'

import { follow, unfollow } from '@/lib/api/social'

export async function followUser(followingId: string) {
  const response = await follow(followingId)
  if (response.error) throw new Error(response.error)
}

export async function unfollowUser(followingId: string) {
  const response = await unfollow(followingId)
  if (response.error) throw new Error(response.error)
}
