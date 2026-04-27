'use client'

import { useRouter } from 'next/navigation'

interface RecordStatusBarProps {
  isLoggedIn: boolean
  currentStatus?: 'watched' | 'watching' | 'want'
}

const STATUSES = [
  { id: 'watched' as const, label: '봄', emoji: '✅' },
  { id: 'watching' as const, label: '보는 중', emoji: '▶️' },
  { id: 'want' as const, label: '보고 싶음', emoji: '🔖' },
]

export function RecordStatusBar({ isLoggedIn, currentStatus }: RecordStatusBarProps) {
  const router = useRouter()

  function handleClick() {
    if (!isLoggedIn) {
      router.push('/login')
    }
  }

  return (
    <div className="flex gap-2">
      {STATUSES.map(({ id, label, emoji }) => {
        const isActive = currentStatus === id
        return (
          <button
            key={id}
            onClick={handleClick}
            className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary text-white'
                : 'bg-surface text-text hover:bg-border'
            }`}
          >
            <span className="text-xl">{emoji}</span>
            <span className="text-[12px]">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
