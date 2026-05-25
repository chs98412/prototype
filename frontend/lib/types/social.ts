import type { UserProfile } from './profile'
import type { Record } from './records'
import type { Notification } from './notification'

export type Follow = {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export type FeedItem = Record & {
  friend_id?: string
  display_name?: string | null
  avatar_url?: string | null
}

export type FollowResponse = { success: boolean; following: boolean }
export type UnfollowResponse = { success: boolean }
export type IsFollowingResponse = { is_following: boolean }

export type { Notification }
