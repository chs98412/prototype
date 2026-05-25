export type Review = {
  id: string
  user_id: string
  tmdb_id: number
  media_type: 'movie' | 'tv'
  title: string
  content: string
  rating?: number
  spoiler?: boolean
  like_count?: number
  comment_count?: number
  created_at: string
  updated_at: string
  user?: {
    display_name: string
    avatar_url?: string
  }
}

export type CreateReviewRequest = {
  tmdb_id: number
  title: string
  content: string
  spoiler?: boolean
  rating?: number
}

export type CreateReviewResponse = Review

export type UpdateReviewRequest = {
  title?: string
  content?: string
  spoiler?: boolean
  rating?: number
}

export type UpdateReviewResponse = Review

export type DeleteReviewResponse = { success: boolean }

export type ReviewLike = {
  id: string
  user_id: string
  review_id: string
  created_at: string
}

export type ReviewLikeStatus = { liked: boolean }
