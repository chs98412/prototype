'use client'

import { useState, useTransition } from 'react'
import { setGoal } from '@/app/actions/goals'

interface YearlyGoalProps {
  currentCount: number
  initialTarget: number | null
}

export function YearlyGoal({ currentCount, initialTarget }: YearlyGoalProps) {
  const [target, setTarget] = useState<number | null>(initialTarget)
  const [setting, setSetting] = useState(false)
  const [input, setInput] = useState(String(initialTarget ?? 50))
  const [isPending, startTransition] = useTransition()

  const year = new Date().getFullYear()
  const pct = target ? Math.min(100, Math.round((currentCount / target) * 100)) : 0
  const achieved = target != null && currentCount >= target

  function handleSave() {
    const num = parseInt(input, 10)
    if (!num || num < 1) return
    startTransition(async () => {
      await setGoal(num)
      setTarget(num)
      setSetting(false)
    })
  }

  if (setting) {
    return (
      <div className="flex flex-col gap-3 px-5 py-4 rounded-2xl bg-surface">
        <p className="text-text font-medium text-[14px]">{year}년 시청 목표 설정</p>
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            max={999}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-[14px] text-text outline-none focus:border-primary"
            placeholder="목표 편수"
          />
          <span className="flex items-center text-muted text-[14px]">편</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSetting(false)}
            className="flex-1 py-2 rounded-xl text-[13px] text-muted bg-border"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex-1 py-2 rounded-xl text-[13px] font-medium bg-primary text-white disabled:opacity-50"
          >
            저장
          </button>
        </div>
      </div>
    )
  }

  if (!target) {
    return (
      <button
        onClick={() => setSetting(true)}
        className="flex items-center justify-between px-5 py-4 rounded-2xl bg-surface w-full text-left"
      >
        <div>
          <p className="text-muted text-[13px]">{year}년 시청 목표</p>
          <p className="text-text text-[15px] font-medium mt-0.5">목표를 설정해보세요</p>
        </div>
        <span className="text-2xl">🎯</span>
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-3 px-5 py-4 rounded-2xl bg-surface">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted text-[13px]">{year}년 시청 목표</p>
          <p className="text-text font-bold text-xl mt-0.5">
            {currentCount} <span className="text-muted text-[14px] font-normal">/ {target}편</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-2xl">{achieved ? '🏆' : '🎯'}</span>
          <button onClick={() => setSetting(true)} className="text-muted text-[11px] underline">
            수정
          </button>
        </div>
      </div>

      <div className="h-2 rounded-full bg-border overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${achieved ? 'bg-yellow-400' : 'bg-primary'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {achieved ? (
        <p className="text-[13px] font-medium text-yellow-500">🎉 목표 달성! 새 목표를 설정해보세요</p>
      ) : (
        <p className="text-muted text-[12px]">{pct}% 달성 · {target - currentCount}편 남음</p>
      )}
    </div>
  )
}
