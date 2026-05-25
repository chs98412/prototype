'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getClientToken } from '@/lib/auth/getToken'
import { API_URL, IMG_BASE } from '@/lib/config'

type Status = 'watched' | 'watching' | 'want'

const TABS: { id: Status; label: string }[] = [
  { id: 'watched', label: '봄' },
  { id: 'watching', label: '보는 중' },
  { id: 'want', label: '보고 싶음' },
]

type RecordItem = {
  tmdb_id: number
  media_type: string
  status: string
  rating: number | null
  title: string | null
  poster_path: string | null
}

export function RecordTabs({ userId, showAllTabs }: { userId: string; showAllTabs: boolean }) {
  const [activeTab, setActiveTab] = useState<Status>('watched')
  const [records, setRecords] = useState<RecordItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecords() {
      setLoading(true)
      try {
        const token = await getClientToken()
        const res = await fetch(`${API_URL}/v1/records?status=${activeTab}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to fetch records')
        const json = await res.json()
        setRecords((json.data ?? []) as RecordItem[])
      } catch (err) {
        console.error('Failed to fetch records:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchRecords()
  }, [userId, activeTab])

  return (
    <div className="flex flex-col gap-3">
      {showAllTabs && (
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-xl text-[13px] font-medium transition-colors ${
                activeTab === tab.id ? 'bg-primary text-white' : 'bg-surface text-muted'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <span className="text-3xl">🎬</span>
          <p className="text-muted text-sm">아직 기록이 없어요</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {records.map((r) => {
            const key = `${r.media_type}-${r.tmdb_id}`
            return (
              <Link key={key} href={`/content/${r.media_type}/${r.tmdb_id}`} className="flex flex-col gap-1">
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface">
                  {r.poster_path ? (
                    <Image
                      src={`${IMG_BASE}/w185${r.poster_path}`}
                      alt={r.title ?? ''}
                      fill
                      className="object-cover"
                      sizes="30vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🎬</div>
                  )}
                  {r.rating != null && activeTab === 'watched' && (
                    <div className="absolute bottom-1 right-1 bg-black/60 rounded px-1 py-0.5">
                      <span className="text-white text-[10px] font-bold">⭐{r.rating}</span>
                    </div>
                  )}
                </div>
                {r.title && (
                  <p className="text-text text-[11px] font-medium leading-tight line-clamp-2">{r.title}</p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
