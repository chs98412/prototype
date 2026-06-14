// Backend API response types

export type ApiList<T> = { data: T[]; count: number }

export type SocialFeedItem = {
  kind: 'review' | 'record'
  id: string
  user_id: string
  display_name: string
  avatar_url: string
  tmdb_id: number
  title: string
  poster_path: string
  content?: string
  like_count: number
  rating?: number
  spoiler?: boolean
  event_time: string
}

export type NotificationDTO = {
  id: string
  recipient_id: string
  sender_id: string
  type: string
  content: string
  created_at: string
}

export type ProfileDTO = {
  user_id: string
  display_name: string
  bio: string
  avatar_url: string
}

export type RecordDTO = {
  id: string
  user_id: string
  tmdb_id: number
  media_type: string
  status: string
  rating: number
  title: string
  poster_path: string
  created_at: string
  updated_at: string
}

export type RecordStatsDTO = {
  total_records: number
  movies_watched: number
  shows_watched: number
  average_rating: number
  highest_rating: number
  rated_count: number
}

export type ReviewDTO = {
  id: string
  user_id: string
  tmdb_id: number
  media_type: string
  title: string
  poster_path: string
  content: string
  spoiler: boolean
  like_count: number
  created_at: string
  updated_at: string
}

export type TmdbSearchResult = {
  id: number
  title: string
  poster_path: string | null
  release_date: string
  vote_average: number
  original_title: string
  overview: string
}

export type TmdbSearchResponse = {
  results: TmdbSearchResult[]
  total_results: number
  page: number
  total_pages: number
}

export type TmdbMovieDetail = {
  id: number
  title: string
  original_title: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  runtime: number
  overview: string
  genres: Array<{ id: number; name: string }>
  credits?: {
    cast: Array<{ id: number; name: string; character: string }>
    crew: Array<{ id: number; name: string; job: string; department: string }>
  }
}
