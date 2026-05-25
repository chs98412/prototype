import { apiCall, ApiResponse } from './client'
import type { HeatmapData, GenreRating, TasteMatchDetail } from '@/lib/types/analytics'

export async function getHeatmap(): Promise<ApiResponse<HeatmapData[]>> {
  return apiCall<HeatmapData[]>('/v1/heatmap')
}

export async function getGenreRatings(): Promise<ApiResponse<GenreRating[]>> {
  return apiCall<GenreRating[]>('/v1/genres/ratings')
}

export async function getTasteMatch(userId: string): Promise<ApiResponse<TasteMatchDetail>> {
  return apiCall<TasteMatchDetail>(`/v1/taste-match/${userId}`)
}
