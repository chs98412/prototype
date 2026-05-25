import { apiCall, ApiResponse } from './client'

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
}): Promise<ApiResponse<any>> {
  return apiCall<any>('/v1/profile', {
    method: 'PUT',
    body: data,
  })
}
