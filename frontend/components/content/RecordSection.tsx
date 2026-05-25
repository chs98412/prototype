'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { getClientToken } from '@/lib/auth/getToken'
import { API_URL } from '@/lib/config'
import { upsertRecord, deleteRecord, type RecordStatus } from '@/app/actions/records'
import { StarRating } from './StarRating'

interface RecordSectionProps {
  tmdbId: number
  mediaType: 'movie' | 'tv'
  isLoggedIn: boolean
  title?: string
  posterPath?: string
  genreIds?: number[]
}

type UserRecord = { status: RecordStatus; rating: number | null }

const STATUSES: { id: RecordStatus; label: string; emoji: string }[] = [
  { id: 'watched', label: '봄', emoji: '✅' },
  { id: 'watching', label: '보는 중', emoji: '▶️' },
  { id: 'want', label: '보고 싶음', emoji: '🔖' },
]

export function RecordSection({ tmdbId, mediaType, isLoggedIn, title, posterPath, genreIds }: RecordSectionProps) {
  const router = useRouter()
  const [record, setRecord] = useState<UserRecord | null>(null)
  const [loadingRecord, setLoadingRecord] = useState(isLoggedIn)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!isLoggedIn) return

    async function fetchRecord() {
      try {
        const token = await getClientToken()
        const res = await fetch(`${API_URL}/v1/records?tmdb_id=${tmdbId}&media_type=${mediaType}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to fetch record')
        const json = await res.json()
        if (json.data && json.data.length > 0) {
          setRecord(json.data[0] as UserRecord)
        }
      } catch (err) {
        console.error('Failed to fetch record:', err)
      } finally {
        setLoadingRecord(false)
      }
    }
    fetchRecord()
  }, [tmdbId, mediaType, isLoggedIn])

  function handleStatus(status: RecordStatus) {
    if (!isLoggedIn) { router.push('/login'); return }

    const next: UserRecord = {
      status,
      rating: status === 'watched' ? (record?.rating ?? null) : null,
    }
    setRecord(next)
    startTransition(() => upsertRecord({ tmdbId, mediaType, status, rating: next.rating ?? undefined, title, posterPath, genreIds }))
  }

  function handleRating(rating: number) {
    const next: UserRecord = { status: 'watched', rating }
    setRecord(next)
    startTransition(() => upsertRecord({ tmdbId, mediaType, status: 'watched', rating, title, posterPath, genreIds }))
  }

  function handleDelete() {
    setRecord(null)
    startTransition(() => deleteRecord({ tmdbId }))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-text font-semibold text-[15px]">내 기록</h2>
        {record && (
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-[12px] text-muted underline disabled:opacity-40"
          >
            삭제
          </button>
        )}
      </div>

      {/* Status buttons */}
      <div className="flex gap-2">
        {STATUSES.map(({ id, label, emoji }) => {
          const isActive = record?.status === id
          return (
            <button
              key={id}
              onClick={() => handleStatus(id)}
              disabled={isPending || loadingRecord}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${
                isActive ? 'bg-primary text-white' : 'bg-surface text-text active:bg-border'
              }`}
            >
              <span className="text-xl">{emoji}</span>
              <span className="text-[12px]">{label}</span>
            </button>
          )
        })}
      </div>

      {/* Star rating — only when status is 'watched' */}
      {record?.status === 'watched' && (
        <div className="flex flex-col gap-2 px-1">
          <p className="text-muted text-[13px]">별점</p>
          <StarRating
            value={record.rating ?? 0}
            onChange={handleRating}
            disabled={isPending}
          />
        </div>
      )}

      {!isLoggedIn && (
        <p className="text-muted text-[12px] text-center">로그인하면 기록을 남길 수 있어요</p>
      )}
    </div>
  )
}
