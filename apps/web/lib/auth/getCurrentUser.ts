'use server'

import { getServerToken } from './getServerToken'
import { API_URL } from '@/lib/config'

export type CurrentUser = {
  id: string
  email: string
  display_name?: string
  avatar_url?: string
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const token = await getServerToken()
    if (!token) return null

    const res = await fetch(`${API_URL}/v1/me`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    })

    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
