import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_KEY } from './config'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  return data?.session
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null
  
  const { data, error } = await supabase.auth.getUser()
  return data?.user
}
