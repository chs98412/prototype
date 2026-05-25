import { apiCall } from './client'

export async function getHeatmap() {
  return apiCall<any>('/v1/heatmap')
}

export async function getGenreRatings() {
  return apiCall<any>('/v1/genres/ratings')
}

export async function getTasteMatch(userId: string) {
  return apiCall<any>(`/v1/taste-match/${userId}`)
}
