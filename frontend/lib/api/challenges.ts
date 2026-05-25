import { apiCall, ApiResponse } from './client'
import type {
  Challenge,
  UserGoal,
  UpdateGoalRequest,
  UpdateGoalResponse,
  UserChallenge,
  StartChallengeResponse,
  AbandonChallengeResponse,
} from '@/lib/types/challenges'

export async function getGoal(): Promise<ApiResponse<UserGoal>> {
  return apiCall<UserGoal>('/v1/goals')
}

export async function updateGoal(data: UpdateGoalRequest): Promise<ApiResponse<UpdateGoalResponse>> {
  return apiCall<UpdateGoalResponse>('/v1/goals', {
    method: 'PUT',
    body: data,
  })
}

export async function getChallenges(limit = 50): Promise<ApiResponse<Challenge[]>> {
  return apiCall<Challenge[]>(`/v1/challenges?limit=${limit}`)
}

export async function getUserChallenges(
  limit = 50,
  status = 'active'
): Promise<ApiResponse<UserChallenge[]>> {
  return apiCall<UserChallenge[]>(`/v1/user-challenges?limit=${limit}&status=${status}`)
}

export async function startChallenge(
  challengeId: string
): Promise<ApiResponse<StartChallengeResponse>> {
  return apiCall<StartChallengeResponse>(`/v1/challenges/${challengeId}/start`, {
    method: 'POST',
  })
}

export async function abandonChallenge(
  progressId: string
): Promise<ApiResponse<AbandonChallengeResponse>> {
  return apiCall<AbandonChallengeResponse>(`/v1/challenges/${progressId}/abandon`, {
    method: 'DELETE',
  })
}
