'use server'

import { updateGoal } from '@/lib/api/client'

export async function setGoal(target: number) {
  const response = await updateGoal({
    movie_goal: target,
    drama_goal: 0,
  })

  if (response.error) throw new Error(response.error)
}
