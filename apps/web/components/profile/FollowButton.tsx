'use client'

import { useState, useTransition } from 'react'
import { followUser, unfollowUser } from '@/app/actions/follows'

interface FollowButtonProps {
  targetUserId: string
  initialFollowing: boolean
}

export function FollowButton({ targetUserId, initialFollowing }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)
  const [isPending, startTransition] = useTransition()

  function toggle() {
    const next = !following
    setFollowing(next)
    startTransition(() => next ? followUser(targetUserId) : unfollowUser(targetUserId))
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 ${
        following
          ? 'bg-surface text-text border border-border'
          : 'bg-primary text-white'
      }`}
    >
      {following ? '팔로잉' : '팔로우'}
    </button>
  )
}
