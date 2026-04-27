'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BottomNav } from '@/components/layout/BottomNav'

type SearchResult = {
  id: number
  type: 'movie' | 'tv'
  title: string
  year?: string
  poster?: string
  rating?: string
}

const TYPE_LABEL: Record<string, string> = { movie: '영화', tv: '시리즈' }

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted flex-shrink-0">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function ClearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function ResultCard({ item }: { item: SearchResult }) {
  return (
    <Link href={`/content/${item.type}/${item.id}`} className="flex gap-3 px-4 py-3 active:bg-surface transition-colors">
      <div className="relative w-[52px] h-[78px] rounded-lg overflow-hidden bg-surface flex-shrink-0">
        {item.poster ? (
          <Image src={item.poster} alt={item.title} fill className="object-cover" sizes="52px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-lg">🎬</div>
        )}
      </div>
      <div className="flex flex-col justify-center gap-1 min-w-0">
        <p className="text-text font-semibold text-[15px] leading-snug line-clamp-2">{item.title}</p>
        <div className="flex items-center gap-2 text-muted text-[13px]">
          {item.type && (
            <span className="px-2 py-0.5 rounded-full bg-surface text-[12px]">
              {TYPE_LABEL[item.type] ?? item.type}
            </span>
          )}
          {item.year && <span>{item.year}</span>}
          {item.rating && item.rating !== '0.0' && <span>⭐ {item.rating}</span>}
        </div>
      </div>
    </Link>
  )
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[] | null>(null)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!query.trim()) {
      setResults(null)
      setLoading(false)
      return
    }
    setLoading(true)
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.results ?? [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [query])

  const showInitial = !query.trim()
  const showLoading = query.trim() && loading
  const showEmpty = query.trim() && !loading && results?.length === 0
  const showResults = query.trim() && !loading && results && results.length > 0

  return (
    <main className="flex flex-col min-h-screen bg-background pb-16">
      <div className="sticky top-0 bg-background border-b border-border px-4 py-3 z-10">
        <div className="flex items-center gap-2.5 bg-surface rounded-xl px-4 h-12">
          <SearchIcon />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="영화, 시리즈 검색..."
            className="flex-1 bg-transparent text-text text-[15px] outline-none placeholder:text-muted"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-muted p-0.5 rounded-full hover:text-text transition-colors"
              aria-label="검색어 지우기"
            >
              <ClearIcon />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1">
        {showInitial && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center px-6">
            <span className="text-5xl">🔍</span>
            <p className="text-text font-semibold text-lg">작품을 검색해보세요</p>
            <p className="text-muted text-sm">영화, 시리즈 제목을 한국어 또는 영어로 검색하세요</p>
          </div>
        )}

        {showLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {showEmpty && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center px-6">
            <span className="text-5xl">😕</span>
            <p className="text-text font-semibold">검색 결과가 없어요</p>
            <p className="text-muted text-sm">
              &ldquo;{query}&rdquo; 에 대한 결과를 찾을 수 없어요.<br />
              다른 검색어를 시도해보세요.
            </p>
          </div>
        )}

        {showResults && (
          <div className="divide-y divide-border">
            {results!.map((item) => (
              <ResultCard key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>
        )}
      </div>

      <BottomNav active="search" />
    </main>
  )
}
