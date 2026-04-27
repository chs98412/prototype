export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Logo } from '@/design-system/components/Logo'
import { OAuthButtons } from '@/components/auth/OAuthButtons'

export default function LoginPage() {
  const callbackUrl =
    process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
      : 'http://localhost:3000/auth/callback'

  return (
    <main className="flex flex-col min-h-screen bg-background px-6">
      <div className="pt-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface transition-colors text-text"
          aria-label="뒤로가기"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
      </div>

      <div className="flex flex-col flex-1 items-center justify-center gap-8 py-8 max-w-md mx-auto w-full">
        <div className="flex flex-col items-center gap-4 text-center">
          <Logo size="md" />
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-text">시작하기</h1>
            <p className="text-muted text-sm">소셜 계정으로 간편하게 로그인하세요</p>
          </div>
        </div>

        <div className="w-full">
          <OAuthButtons redirectTo={callbackUrl} />
        </div>

        <p className="text-xs text-muted text-center leading-relaxed">
          계속 진행하면{' '}
          <span className="underline">이용약관</span>
          {' '}및{' '}
          <span className="underline">개인정보처리방침</span>
          에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </main>
  )
}
