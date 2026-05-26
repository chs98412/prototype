'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BottomNav } from '@/components/layout/BottomNav'
import SearchGridView from '@/components/search/SearchGridView'

type SearchResult = {
  id: number
  type: 'movie' | 'tv'
  title: string
  year?: string
  poster?: string
  rating?: string
  genre?: string
  language?: string
}

function BackArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted flex-shrink-0">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  )
}

function MetaText({ year, genre, language }: { year?: string; genre?: string; language?: string }) {
  const parts = [year, genre, language].filter(Boolean)
  return <span>{parts.join(' · ')}</span>
}

function ListItem({ item }: { item: SearchResult }) {
  return (
    <Link href={`/content/${item.type}/${item.id}`} className="flex gap-3 px-4 py-3 active:bg-surface transition-colors">
      <div className="relative w-[56px] flex-shrink-0" style={{ aspectRatio: '2/3' }}>
        {item.poster ? (
          <Image src={item.poster} alt={item.title} fill className="object-cover" sizes="56px" />
        ) : (
          <div className="w-full h-full bg-surface" />
        )}
      </div>
      <div className="flex flex-col justify-center gap-1 min-w-0">
        <p className="text-text font-semibold text-[16px] leading-snug line-clamp-2">{item.title}</p>
        <p className="text-muted text-[13px]">
          <MetaText year={item.year} genre={item.genre} language={item.language} />
        </p>
      </div>
    </Link>
  )
}

function GridItem({ item }: { item: SearchResult }) {
  return (
    <Link href={`/content/${item.type}/${item.id}`} className="flex flex-col active:opacity-70 transition-opacity">
      <div className="relative w-full" style={{ aspectRatio: '2/3' }}>
        {item.poster ? (
          <Image src={item.poster} alt={item.title} fill className="object-cover" sizes="50vw" />
        ) : (
          <div className="w-full h-full bg-surface" />
        )}
      </div>
      <div className="mt-1.5 px-0.5">
        <p className="text-text font-semibold text-[13px] leading-snug line-clamp-1">{item.title}</p>
        <p className="text-muted text-[11px] mt-0.5">
          <MetaText year={item.year} genre={item.genre} language={item.language} />
        </p>
      </div>
    </Link>
  )
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const savedMode = localStorage.getItem('searchViewMode') as 'list' | 'grid' | null
    if (savedMode) setViewMode(savedMode)
  }, [])

  useEffect(() => {
    localStorage.setItem('searchViewMode', viewMode)
  }, [viewMode])

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.results ?? [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const showInitial = !results
  const showLoading = loading
  const showEmpty = !loading && results?.length === 0
  const showResults = !loading && results && results.length > 0

  return (
    <main className="flex flex-col min-h-screen bg-background pb-14">
      <div className="sticky top-0 bg-background border-b border-border px-4 py-3 z-10">
        <div className="flex items-center gap-2">
          {query && (
            <button
              onClick={() => { setQuery(''); setResults(null) }}
              className="text-text flex-shrink-0 p-1"
              aria-label="검색어 지우기"
            >
              <BackArrowIcon />
            </button>
          )}
          <div className="flex-1 flex items-center bg-surface rounded-full px-4 h-11 gap-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="영화, 시리즈 검색..."
              className="flex-1 bg-transparent text-text text-[15px] outline-none placeholder:text-muted"
            />
            <button onClick={handleSearch} aria-label="검색">
              <SearchIcon />
            </button>
          </div>
          <button
            onClick={() => setViewMode((v) => v === 'list' ? 'grid' : 'list')}
            className="text-text flex-shrink-0 p-1"
            aria-label="보기 전환"
          >
            {viewMode === 'list' ? <GridIcon /> : <ListIcon />}
          </button>
        </div>
      </div>

      <div className="flex-1">
        {showInitial && (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center px-6">
            <p className="text-text font-semibold text-lg">작품을 검색해보세요</p>
            <p className="text-muted text-sm">영화, 시리즈 제목을 한국어 또는 영어로 검색하세요</p>
          </div>
        )}

        {showLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-text border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {showEmpty && (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center px-6">
            <p className="text-text font-semibold">검색 결과가 없어요</p>
            <p className="text-muted text-sm">
              &ldquo;{query}&rdquo; 에 대한 결과를 찾을 수 없어요.
            </p>
          </div>
        )}

        {showResults && viewMode === 'list' && (
          <div className="divide-y divide-border">
            {results!.map((item) => (
              <ListItem key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>
        )}

        {showResults && viewMode === 'grid' && (
          <SearchGridView results={results!} />
        )}
      </div>

      <BottomNav active="search" />
    </main>
  )
}
