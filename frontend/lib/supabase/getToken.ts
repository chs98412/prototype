import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function getClientToken(): Promise<string> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || ''
}

export async function getServerToken(): Promise<string> {
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || ''
}
