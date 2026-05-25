'use server'

import { getServerToken } from '@/lib/auth/getServerToken'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export interface ApiResponse<T> {
  data?: T
  error?: string
  success?: boolean
  count?: number
}

/**
 * API 호출 헬퍼 (Server Action용)
 * JWT 토큰 자동 주입
 */
export async function apiCall<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: any
    token?: string
  } = {}
): Promise<ApiResponse<T>> {
  try {
    // 토큰이 제공되지 않으면 쿠키에서 가져오기
    let token = options.token
    if (!token) {
      token = await getServerToken()
    }

    if (!token) {
      return { error: 'Unauthorized' }
    }

    const url = `${API_URL}${endpoint}`
    const method = options.method || 'GET'
    const body = options.body ? JSON.stringify(options.body) : undefined

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        error: errorData.error || `API Error: ${response.status}`,
      }
    }

    const data = await response.json()
    return data
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Client Component용 API 호출
 * (next/navigation의 useRouter 사용)
 */
export async function clientApiCall<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: any
    token: string
  }
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_URL}${endpoint}`
    const method = options.method || 'GET'
    const body = options.body ? JSON.stringify(options.body) : undefined

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${options.token}`,
      },
      body,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        error: errorData.error || `API Error: ${response.status}`,
      }
    }

    const data = await response.json()
    return data
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================
// Profile API
// ============================================

export async function getProfile() {
  return apiCall<any>('/v1/profile')
}

export async function getUserProfile(userId: string) {
  return apiCall<any>(`/v1/profile/${userId}`)
}

export async function updateProfile(data: {
  display_name?: string
  bio?: string
  avatar_url?: string
}) {
  return apiCall<any>('/v1/profile', {
    method: 'PUT',
    body: data,
  })
}

// ============================================
// Records API
// ============================================

export async function getRecords(limit = 20, offset = 0) {
  return apiCall<any>(`/v1/records?limit=${limit}&offset=${offset}`)
}

export async function createRecord(data: {
  tmdb_id: number
  record_type: 'movie' | 'tv'
  rating: number
}) {
  return apiCall<any>('/v1/records', {
    method: 'POST',
    body: data,
  })
}

export async function deleteRecord(recordId: string) {
  return apiCall<any>(`/v1/records/${recordId}`, {
    method: 'DELETE',
  })
}

export async function deleteRecordByTmdbId(tmdbId: number) {
  return apiCall<any>(`/v1/records/tmdb/${tmdbId}`, {
    method: 'DELETE',
  })
}

export async function getRecordStats() {
  return apiCall<any>('/v1/records/stats')
}

// ============================================
// Reviews API
// ============================================

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
}) {
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
) {
  return apiCall<any>(`/v1/reviews/${reviewId}`, {
    method: 'PUT',
    body: data,
  })
}

export async function deleteReview(reviewId: string) {
  return apiCall<any>(`/v1/reviews/${reviewId}`, {
    method: 'DELETE',
  })
}

export async function getReviewsByTmdbId(tmdbId: number, limit = 20) {
  return apiCall<any>(`/v1/tmdb/${tmdbId}/reviews?limit=${limit}`)
}

// ============================================
// Review Likes API
// ============================================

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

export async function likeReview(reviewId: string) {
  return apiCall<any>(`/v1/reviews/${reviewId}/like`, {
    method: 'POST',
  })
}

export async function unlikeReview(reviewId: string) {
  return apiCall<any>(`/v1/reviews/${reviewId}/like`, {
    method: 'DELETE',
  })
}

// ============================================
// Social API
// ============================================

export async function getFollows(limit = 50) {
  return apiCall<any>(`/v1/follows?limit=${limit}`)
}

export async function getFollowers(limit = 50) {
  return apiCall<any>(`/v1/followers?limit=${limit}`)
}

export async function follow(userId: string) {
  return apiCall<any>(`/v1/follow/${userId}`, {
    method: 'POST',
  })
}

export async function unfollow(userId: string) {
  return apiCall<any>(`/v1/follow/${userId}`, {
    method: 'DELETE',
  })
}

export async function isFollowing(userId: string, token: string) {
  return clientApiCall<any>(`/v1/follow/${userId}/status`, {
    method: 'GET',
    token,
  })
}

export async function getFeed(limit = 20, offset = 0) {
  return apiCall<any>(`/v1/feed?limit=${limit}&offset=${offset}`)
}

export async function getNotifications(limit = 20, offset = 0) {
  return apiCall<any>(`/v1/notifications?limit=${limit}&offset=${offset}`)
}

// ============================================
// Goals & Challenges API
// ============================================

export async function getGoal() {
  return apiCall<any>('/v1/goals')
}

export async function updateGoal(data: {
  movie_goal: number
  drama_goal: number
}) {
  return apiCall<any>('/v1/goals', {
    method: 'PUT',
    body: data,
  })
}

export async function getChallenges(limit = 50) {
  return apiCall<any>(`/v1/challenges?limit=${limit}`)
}

export async function getUserChallenges(limit = 50, status = 'active') {
  return apiCall<any>(`/v1/user-challenges?limit=${limit}&status=${status}`)
}

export async function startChallenge(challengeId: string) {
  return apiCall<any>(`/v1/challenges/${challengeId}/start`, {
    method: 'POST',
  })
}

export async function abandonChallenge(progressId: string) {
  return apiCall<any>(`/v1/challenges/${progressId}/abandon`, {
    method: 'DELETE',
  })
}

// ============================================
// Analytics API
// ============================================

export async function getHeatmap() {
  return apiCall<any>('/v1/heatmap')
}

export async function getGenreRatings() {
  return apiCall<any>('/v1/genres/ratings')
}

export async function getTasteMatch(userId: string) {
  return apiCall<any>(`/v1/taste-match/${userId}`)
}
