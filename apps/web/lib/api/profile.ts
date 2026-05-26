import { apiCall, ApiResponse } from './client'
import type { UserProfile, UpdateProfileRequest, UpdateProfileResponse } from '@/lib/types/profile'

export async function getProfile(): Promise<ApiResponse<UserProfile>> {
  return apiCall<UserProfile>('/v1/profile')
}

export async function getUserProfile(userId: string): Promise<ApiResponse<UserProfile>> {
  return apiCall<UserProfile>(`/v1/profile/${userId}`)
}

export async function updateProfile(
  data: UpdateProfileRequest
): Promise<ApiResponse<UpdateProfileResponse>> {
  return apiCall<UpdateProfileResponse>('/v1/profile', {
    method: 'PUT',
    body: data,
  })
}
