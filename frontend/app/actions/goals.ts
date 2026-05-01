'use server'

import { updateGoal } from '@/lib/api/client'

export async function setGoal(movieGoal: number, dramaGoal: number) {
  const response = await updateGoal({
    movie_goal: movieGoal,
    drama_goal: dramaGoal,
  })

  if (response.error) throw new Error(response.error)
}
