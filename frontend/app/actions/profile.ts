'use server'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(data: { displayName: string; bio: string }) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Unauthorized')
  const { error } = await supabase
    .from('user_profiles')
    .update({ display_name: data.displayName, bio: data.bio })
    .eq('user_id', session.user.id)
  if (error) throw error
}
