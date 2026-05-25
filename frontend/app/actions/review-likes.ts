'use server'

import { getServerToken } from '@/lib/supabase/getToken'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export async function toggleReviewLike(reviewId: string) {
  const token = await getServerToken()
  if (!token) return false

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  // Try to like first
  let response = await fetch(`${API_BASE}/v1/reviews/${reviewId}/like`, {
    method: 'POST',
    headers,
  })

  if (response.ok) {
    return true
  }

  // If already liked (conflict), try to unlike
  if (response.status === 409 || response.status === 400) {
    response = await fetch(`${API_BASE}/v1/reviews/${reviewId}/like`, {
      method: 'DELETE',
      headers,
    })
    if (response.ok) {
      return false
    }
  }

  return false
}
