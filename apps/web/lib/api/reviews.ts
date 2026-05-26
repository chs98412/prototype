import { apiCall, clientApiCall, ApiResponse } from './client'
import type {
  Review,
  CreateReviewRequest,
  CreateReviewResponse,
  UpdateReviewRequest,
  UpdateReviewResponse,
  DeleteReviewResponse,
  ReviewLike,
  ReviewLikeStatus,
} from '@/lib/types/reviews'

export async function getReviews(limit = 20, offset = 0): Promise<ApiResponse<Review[]>> {
  return apiCall<Review[]>(`/v1/reviews?limit=${limit}&offset=${offset}`)
}

export async function getReviewById(reviewId: string): Promise<ApiResponse<Review>> {
  return apiCall<Review>(`/v1/reviews/${reviewId}`)
}

export async function createReview(
  data: CreateReviewRequest
): Promise<ApiResponse<CreateReviewResponse>> {
  return apiCall<CreateReviewResponse>('/v1/reviews', {
    method: 'POST',
    body: data,
  })
}

export async function updateReview(
  reviewId: string,
  data: UpdateReviewRequest
): Promise<ApiResponse<UpdateReviewResponse>> {
  return apiCall<UpdateReviewResponse>(`/v1/reviews/${reviewId}`, {
    method: 'PUT',
    body: data,
  })
}

export async function deleteReview(reviewId: string): Promise<ApiResponse<DeleteReviewResponse>> {
  return apiCall<DeleteReviewResponse>(`/v1/reviews/${reviewId}`, {
    method: 'DELETE',
  })
}

export async function getReviewsByTmdbId(tmdbId: number, limit = 20): Promise<ApiResponse<Review[]>> {
  return apiCall<Review[]>(`/v1/tmdb/${tmdbId}/reviews?limit=${limit}`)
}

export async function getReviewLikes(reviewId: string): Promise<ApiResponse<ReviewLike[]>> {
  return apiCall<ReviewLike[]>(`/v1/reviews/${reviewId}/likes`)
}

export async function checkReviewLike(
  reviewId: string,
  token: string
): Promise<ApiResponse<ReviewLikeStatus>> {
  return clientApiCall<ReviewLikeStatus>(`/v1/reviews/${reviewId}/like/status`, {
    method: 'GET',
    token,
  })
}

export async function likeReview(reviewId: string): Promise<ApiResponse<ReviewLike>> {
  return apiCall<ReviewLike>(`/v1/reviews/${reviewId}/like`, {
    method: 'POST',
  })
}

export async function unlikeReview(reviewId: string): Promise<ApiResponse<DeleteReviewResponse>> {
  return apiCall<DeleteReviewResponse>(`/v1/reviews/${reviewId}/like`, {
    method: 'DELETE',
  })
}
