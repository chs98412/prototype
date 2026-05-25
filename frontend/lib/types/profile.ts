export type UserProfile = {
  id: string
  email: string
  display_name?: string
  avatar_url?: string
  bio?: string
  follower_count?: number
  following_count?: number
  is_following?: boolean
}

export type UpdateProfileRequest = {
  display_name?: string
  bio?: string
  avatar_url?: string
}

export type UpdateProfileResponse = UserProfile
