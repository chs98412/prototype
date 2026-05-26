import Link from 'next/link'
import { Logo } from '@/design-system/components/Logo'

const features = [
  { icon: '🎬', label: '기록' },
  { icon: '🏆', label: '도전과제' },
  { icon: '📊', label: '취향분석' },
  { icon: '🔥', label: '스트릭' },
]

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen bg-background px-6">
      <div className="flex flex-col flex-1 items-center justify-center gap-10 py-16 max-w-md mx-auto w-full">
        <Logo size="lg" />

        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-text leading-tight">
            당신의 영화 취향을<br />기록하세요
          </h1>
          <p className="text-muted text-base">
            영화, 시리즈, 예능을 기록하고<br />나만의 컬렉션을 완성하세요
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {features.map(({ icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface text-text text-sm font-medium"
            >
              {icon} {label}
            </span>
          ))}
        </div>

        <Link
          href="/login"
          className="w-full h-[52px] flex items-center justify-center rounded-xl bg-primary text-white font-semibold text-[15px] active:opacity-80 transition-opacity"
        >
          무료로 시작하기
        </Link>
      </div>
    </main>
  )
}
