export type Challenge = {
  id: string
  title: string
  description: string
  badge_emoji: string
  required_count: number
  category?: string
  created_at: string
}

export type UserGoal = {
  user_id: string
  movie_goal: number
  drama_goal: number
  created_at: string
  updated_at: string
}

export type UpdateGoalRequest = {
  movie_goal: number
  drama_goal: number
}

export type UpdateGoalResponse = UserGoal

export type UserChallenge = {
  id: string
  user_id: string
  challenge_id: string
  current_count: number
  completed_at?: string
  started_at: string
}

export type StartChallengeRequest = {
  challenge_id: string
}

export type StartChallengeResponse = UserChallenge

export type AbandonChallengeResponse = { success: boolean }

export type ChallengeProgress = UserChallenge & {
  challenge: Challenge
  progress_percent: number
}
