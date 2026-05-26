'use client'

import { useState, useTransition } from 'react'
import { toggleReviewLike } from '@/app/actions/review-likes'

interface LikeButtonProps {
  reviewId: string
  initialLiked: boolean
  initialCount: number
  userId: string | null
}

export function LikeButton({ reviewId, initialLiked, initialCount, userId }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!userId || isPending) return
    const nextLiked = !liked
    setLiked(nextLiked)
    setCount((c) => c + (nextLiked ? 1 : -1))
    startTransition(async () => {
      const result = await toggleReviewLike(reviewId)
      setLiked(result)
    })
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleClick}
        disabled={!userId || isPending}
        className="flex items-center gap-1.5 text-text disabled:opacity-40 transition-opacity"
        aria-label={liked ? '좋아요 취소' : '좋아요'}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={liked ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span className="text-[14px]">{count}</span>
      </button>

      <div className="flex items-center gap-1.5 text-muted">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="text-[14px]">0</span>
      </div>
    </div>
  )
}
