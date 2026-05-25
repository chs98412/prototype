import { apiCall, clientApiCall, ApiResponse } from './client'

export async function getReviews(limit = 20, offset = 0) {
  return apiCall<any>(`/v1/reviews?limit=${limit}&offset=${offset}`)
}

export async function getReviewById(reviewId: string) {
  return apiCall<any>(`/v1/reviews/${reviewId}`)
}

export async function createReview(data: {
  tmdb_id: number
  title: string
  content: string
  spoiler?: boolean
  rating?: number
}): Promise<ApiResponse<any>> {
  return apiCall<any>('/v1/reviews', {
    method: 'POST',
    body: data,
  })
}

export async function updateReview(
  reviewId: string,
  data: {
    title?: string
    content?: string
    spoiler?: boolean
    rating?: number
  }
): Promise<ApiResponse<any>> {
  return apiCall<any>(`/v1/reviews/${reviewId}`, {
    method: 'PUT',
    body: data,
  })
}

export async function deleteReview(reviewId: string): Promise<ApiResponse<any>> {
  return apiCall<any>(`/v1/reviews/${reviewId}`, {
    method: 'DELETE',
  })
}

export async function getReviewsByTmdbId(tmdbId: number, limit = 20) {
  return apiCall<any>(`/v1/tmdb/${tmdbId}/reviews?limit=${limit}`)
}

export async function getReviewLikes(reviewId: string) {
  return apiCall<any>(`/v1/reviews/${reviewId}/likes`)
}

export async function checkReviewLike(
  reviewId: string,
  token: string
) {
  return clientApiCall<{ liked: boolean }>(`/v1/reviews/${reviewId}/like/status`, {
    method: 'GET',
    token,
  })
}

export async function likeReview(reviewId: string): Promise<ApiResponse<any>> {
  return apiCall<any>(`/v1/reviews/${reviewId}/like`, {
    method: 'POST',
  })
}

export async function unlikeReview(reviewId: string): Promise<ApiResponse<any>> {
  return apiCall<any>(`/v1/reviews/${reviewId}/like`, {
    method: 'DELETE',
  })
}
