import { apiCall } from './api-client'

export async function searchMovies(query: string) {
  const { data } = await apiCall<{ results: any[] }>(`/v1/movies/search?q=${encodeURIComponent(query)}`)
  return data?.results || []
}

export async function getMovieDetail(id: number) {
  const { data } = await apiCall<any>(`/v1/movies/${id}`)
  return data
}

export function getImageUrl(path: string | null): string | null {
  if (!path) return null
  return `https://image.tmdb.org/t/p/w500${path}`
}
