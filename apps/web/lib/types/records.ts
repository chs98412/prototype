export type RecordStatus = 'watched' | 'watching' | 'want'

export type Record = {
  id: string
  user_id: string
  tmdb_id: number
  media_type: 'movie' | 'tv'
  status: RecordStatus
  rating?: number
  poster_path?: string
  title?: string
  created_at: string
  updated_at: string
}

export type CreateRecordRequest = {
  tmdb_id: number
  record_type: 'movie' | 'tv'
  rating: number
}

export type CreateRecordResponse = Record

export type DeleteRecordResponse = { success: boolean }

export type RecordStats = {
  total_watched: number
  total_watching: number
  total_want: number
  average_rating: number
  movie_count: number
  tv_count: number
}
