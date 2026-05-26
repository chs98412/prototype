import { apiCall, clientApiCall, ApiResponse } from './client'
import type {
  Follow,
  FeedItem,
  Notification,
  FollowResponse,
  UnfollowResponse,
  IsFollowingResponse,
} from '@/lib/types/social'

export async function getFollows(limit = 50): Promise<ApiResponse<Follow[]>> {
  return apiCall<Follow[]>(`/v1/follows?limit=${limit}`)
}

export async function getFollowers(limit = 50): Promise<ApiResponse<Follow[]>> {
  return apiCall<Follow[]>(`/v1/followers?limit=${limit}`)
}

export async function follow(userId: string): Promise<ApiResponse<FollowResponse>> {
  return apiCall<FollowResponse>(`/v1/follow/${userId}`, {
    method: 'POST',
  })
}

export async function unfollow(userId: string): Promise<ApiResponse<UnfollowResponse>> {
  return apiCall<UnfollowResponse>(`/v1/follow/${userId}`, {
    method: 'DELETE',
  })
}

export async function isFollowing(
  userId: string,
  token: string
): Promise<ApiResponse<IsFollowingResponse>> {
  return clientApiCall<IsFollowingResponse>(`/v1/follow/${userId}/status`, {
    method: 'GET',
    token,
  })
}

export async function getFeed(limit = 20, offset = 0): Promise<ApiResponse<FeedItem[]>> {
  return apiCall<FeedItem[]>(`/v1/feed?limit=${limit}&offset=${offset}`)
}

export async function getNotifications(limit = 20, offset = 0): Promise<ApiResponse<Notification[]>> {
  return apiCall<Notification[]>(`/v1/notifications?limit=${limit}&offset=${offset}`)
}
