import type { Record } from './records'

export type HeatmapData = {
  activity_date: string
  cnt: number
}

export type GenreRating = {
  genre_id: number
  genre_name: string
  average_rating: number
  count: number
}

export type TasteMatch = {
  user_id: string
  match_user_id: string
  match_score: number
  common_count: number
}

export type TasteMatchDetail = TasteMatch & {
  user: {
    display_name?: string
    avatar_url?: string
  }
  common_works?: Record[]
}
