import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { Logo } from '@/design-system/components/Logo'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="flex flex-col min-h-screen bg-background">
      <header className="flex items-center justify-between px-4 h-14 border-b border-border">
        <Logo size="sm" />
        <LogoutButton />
      </header>

      <div className="flex flex-col flex-1 items-center justify-center gap-4 px-6 text-center">
        <span className="text-4xl">🎬</span>
        <h1 className="text-xl font-bold text-text">환영합니다!</h1>
        {user?.email && (
          <p className="text-muted text-sm">{user.email}</p>
        )}
        <p className="text-muted text-sm mt-2">
          곧 검색과 기록 기능이 추가됩니다.
        </p>
      </div>
    </main>
  )
}
