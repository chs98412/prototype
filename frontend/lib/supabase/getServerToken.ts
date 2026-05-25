'use server'

import { createClient } from '@/lib/supabase/server'

export async function getServerToken(): Promise<string> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || ''
}
