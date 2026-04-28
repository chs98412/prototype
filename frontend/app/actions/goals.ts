'use server'

import { createClient } from '@/lib/supabase/server'

export async function setGoal(targetCount: number) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Unauthorized')

  const year = new Date().getFullYear()
  const { error } = await supabase.from('user_goals').upsert(
    { user_id: session.user.id, year, target_count: targetCount, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,year' },
  )
  if (error) throw error
}
