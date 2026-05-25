import { apiCall, ApiResponse } from './client'

export async function getGoal() {
  return apiCall<any>('/v1/goals')
}

export async function updateGoal(data: {
  movie_goal: number
  drama_goal: number
}): Promise<ApiResponse<any>> {
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

export async function startChallenge(challengeId: string): Promise<ApiResponse<any>> {
  return apiCall<any>(`/v1/challenges/${challengeId}/start`, {
    method: 'POST',
  })
}

export async function abandonChallenge(progressId: string): Promise<ApiResponse<any>> {
  return apiCall<any>(`/v1/challenges/${progressId}/abandon`, {
    method: 'DELETE',
  })
}
