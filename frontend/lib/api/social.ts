import { apiCall, clientApiCall, ApiResponse } from './client'

export async function getFollows(limit = 50) {
  return apiCall<any>(`/v1/follows?limit=${limit}`)
}

export async function getFollowers(limit = 50) {
  return apiCall<any>(`/v1/followers?limit=${limit}`)
}

export async function follow(userId: string): Promise<ApiResponse<any>> {
  return apiCall<any>(`/v1/follow/${userId}`, {
    method: 'POST',
  })
}

export async function unfollow(userId: string): Promise<ApiResponse<any>> {
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
