'use server'
import { updateProfile as updateProfileApi } from '@/lib/api/profile'

export async function updateProfile(data: { displayName: string; bio?: string }) {
  const response = await updateProfileApi({
    display_name: data.displayName,
    bio: data.bio,
  })
  if (response.error) throw new Error(response.error)
}
