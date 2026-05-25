import { getClientToken } from '@/lib/supabase/getToken'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export interface ApiResponse<T> {
  data?: T
  error?: string
  success?: boolean
}

export async function apiFetch<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: any
    skipAuth?: boolean
  } = {}
): Promise<ApiResponse<T>> {
  try {
    const method = options.method || 'GET'
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
    }

    if (!options.skipAuth) {
      const token = await getClientToken()
      if (!token) {
        return { error: 'Unauthorized - no token available' }
      }
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      return {
        error: errorData.error || `API Error: ${response.status}`,
      }
    }

    const data = await response.json()
    return { data } as ApiResponse<T>
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================
// Profile API
// ============================================

export interface Profile {
  user_id: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  created_at: string
}

export interface ProfileDetail extends Profile {
  follower_count: number
  following_count: number
  total_records: number
  movie_count: number
  is_following: boolean
}

export async function getProfile() {
  return apiFetch<Profile>('/v1/profile')
}

export async function getUserProfile(userId: string) {
  return apiFetch<ProfileDetail>(`/v1/profile/${userId}`)
}

export async function updateProfile(data: {
  display_name?: string
  bio?: string
  avatar_url?: string
}) {
  return apiFetch<Profile>('/v1/profile', {
    method: 'PUT',
    body: data,
  })
}

// ============================================
// Records API
// ============================================

export interface Record {
  id: string
  user_id: string
  tmdb_id: number
  media_type: 'movie' | 'tv'
  status: 'watched' | 'watching' | 'want'
  rating: number | null
  created_at: string
  updated_at: string
}

export async function getRecords(status?: string, limit = 20, offset = 0) {
  const params = new URLSearchParams()
  if (status) params.append('status', status)
  params.append('limit', String(limit))
  params.append('offset', String(offset))
  return apiFetch<Record[]>(`/v1/records?${params}`)
}

export async function upsertRecord(data: {
  tmdb_id: number
  media_type: 'movie' | 'tv'
  status: 'watched' | 'watching' | 'want'
  rating?: number
}) {
  return apiFetch<Record>('/v1/records', {
    method: 'POST',
    body: data,
  })
}

export async function deleteRecord(recordId: string) {
  return apiFetch<void>(`/v1/records/${recordId}`, {
    method: 'DELETE',
  })
}

export async function deleteRecordByTmdbId(tmdbId: number) {
  return apiFetch<void>(`/v1/records/tmdb/${tmdbId}`, {
    method: 'DELETE',
  })
}

export async function getRecordStats() {
  return apiFetch<{ watched_count: number; watching_count: number; want_count: number }>('/v1/records/stats')
}

// ============================================
// Reviews API
// ============================================

export interface Review {
  id: string
  user_id: string
  tmdb_id: number
  media_type?: string
  content: string
  is_spoiler: boolean
  created_at: string
  updated_at: string
  like_count?: number
  user_liked?: boolean
  user_profiles?: {
    display_name: string | null
    avatar_url: string | null
  } | null
}

export async function getReviews(limit = 20, offset = 0) {
  return apiFetch<Review[]>(`/v1/reviews?limit=${limit}&offset=${offset}`)
}

export async function getReviewById(reviewId: string) {
  return apiFetch<Review>(`/v1/reviews/${reviewId}`)
}

export async function getReviewsByTmdbId(tmdbId: number, limit = 20) {
  return apiFetch<Review[]>(`/v1/tmdb/${tmdbId}/reviews?limit=${limit}`)
}

export async function upsertReview(data: {
  tmdb_id: number
  content: string
  is_spoiler?: boolean
}) {
  return apiFetch<Review>('/v1/reviews', {
    method: 'POST',
    body: data,
  })
}

export async function updateReview(
  reviewId: string,
  data: {
    content?: string
    is_spoiler?: boolean
  }
) {
  return apiFetch<Review>(`/v1/reviews/${reviewId}`, {
    method: 'PUT',
    body: data,
  })
}

export async function deleteReview(reviewId: string) {
  return apiFetch<void>(`/v1/reviews/${reviewId}`, {
    method: 'DELETE',
  })
}

export async function likeReview(reviewId: string) {
  return apiFetch<void>(`/v1/reviews/${reviewId}/like`, {
    method: 'POST',
  })
}

export async function unlikeReview(reviewId: string) {
  return apiFetch<void>(`/v1/reviews/${reviewId}/like`, {
    method: 'DELETE',
  })
}

// ============================================
// Social API
// ============================================

export interface FeedItem {
  tmdb_id: number
  media_type: string
  status: string
  rating: number | null
  title: string | null
  poster_path: string | null
  updated_at: string
  friend_id: string
  display_name: string | null
  avatar_url: string | null
}

export async function getFeed(limit = 20, offset = 0) {
  return apiFetch<FeedItem[]>(`/v1/feed?limit=${limit}&offset=${offset}`)
}

export async function getFollows(limit = 50) {
  return apiFetch<Profile[]>(`/v1/follows?limit=${limit}`)
}

export async function getFollowers(limit = 50) {
  return apiFetch<Profile[]>(`/v1/followers?limit=${limit}`)
}

export async function follow(userId: string) {
  return apiFetch<void>(`/v1/follow/${userId}`, {
    method: 'POST',
  })
}

export async function unfollow(userId: string) {
  return apiFetch<void>(`/v1/follow/${userId}`, {
    method: 'DELETE',
  })
}

export async function isFollowing(userId: string) {
  return apiFetch<{ following: boolean }>(`/v1/follow/${userId}/status`)
}

// ============================================
// Analytics API
// ============================================

export interface HeatmapData {
  activity_date: string
  cnt: number
}

export interface TasteMatchResult {
  match_pct: number | null
  common_count: number
}

export interface GenreRating {
  genre_id: number
  genre_name: string
  avg_rating: number
  count: number
}

export async function getHeatmap() {
  return apiFetch<HeatmapData[]>('/v1/heatmap')
}

export async function getTasteMatch(userId: string) {
  return apiFetch<TasteMatchResult>(`/v1/taste-match/${userId}`)
}

export async function getGenreRatings() {
  return apiFetch<GenreRating[]>('/v1/genres/ratings')
}

// ============================================
// Notifications API
// ============================================

export interface Notification {
  id: string
  user_id: string
  type: string
  content: string
  is_read: boolean
  created_at: string
}

export async function getNotifications(limit = 20, offset = 0) {
  return apiFetch<Notification[]>(`/v1/notifications?limit=${limit}&offset=${offset}`)
}

export async function deleteNotification(notificationId: string) {
  return apiFetch<void>(`/v1/notifications/${notificationId}`, {
    method: 'DELETE',
  })
}

// ============================================
// Challenges API
// ============================================

export interface Challenge {
  id: string
  title: string
  description: string
  required_count: number
  badge_emoji: string
}

export interface ChallengeProgress {
  challenge_id: string
  current_count: number
  completed_at: string | null
}

export interface ChallengeWithProgress {
  challenge: Challenge
  progress: ChallengeProgress | null
}

export async function getChallenges() {
  return apiFetch<ChallengeWithProgress[]>('/v1/challenges')
}

// ============================================
// Goals API
// ============================================

export interface Goal {
  user_id: string
  year: number
  target_count: number
}

export async function getGoal() {
  return apiFetch<Goal>('/v1/goal')
}

export async function setGoal(targetCount: number) {
  return apiFetch<Goal>('/v1/goal', {
    method: 'PUT',
    body: { target_count: targetCount },
  })
}
