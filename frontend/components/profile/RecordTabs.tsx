'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getRecords, type Record } from '@/lib/api/fetch'

const IMG_BASE = 'https://image.tmdb.org/t/p'

type Status = 'watched' | 'watching' | 'want'

const TABS: { id: Status; label: string }[] = [
  { id: 'watched', label: '봄' },
  { id: 'watching', label: '보는 중' },
  { id: 'want', label: '보고 싶음' },
]

export function RecordTabs({ userId, showAllTabs }: { userId: string; showAllTabs: boolean }) {
  const [activeTab, setActiveTab] = useState<Status>('watched')
  const [records, setRecords] = useState<Record[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRecords = async () => {
      setLoading(true)
      const response = await getRecords(activeTab, 100, 0)
      if (!response.error && response.data) {
        setRecords(response.data)
      }
      setLoading(false)
    }
    loadRecords()
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
                  <div className="w-full h-full flex items-center justify-center text-2xl bg-border">🎬</div>
                  {r.rating != null && activeTab === 'watched' && (
                    <div className="absolute bottom-1 right-1 bg-black/60 rounded px-1 py-0.5">
                      <span className="text-white text-[10px] font-bold">⭐{r.rating}</span>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
