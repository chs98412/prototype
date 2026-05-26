'use client'

import { LoadingSpinner } from '@/components/ui/Loading'

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 flex-shrink-0">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function BackArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

interface AlbumSearchBarProps {
  query: string
  onQueryChange: (query: string) => void
  onSearch: () => void
  isLoading: boolean
}

export default function AlbumSearchBar({ query, onQueryChange, onSearch, isLoading }: AlbumSearchBarProps) {
  return (
    <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
      <div className="flex items-center gap-3">
        {query && (
          <button
            onClick={() => onQueryChange('')}
            className="flex-shrink-0 text-gray-900 hover:text-gray-700"
          >
            <BackArrowIcon />
          </button>
        )}

        <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
          <input
            type="text"
            placeholder="음반 또는 아티스트..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            className="bg-transparent text-sm outline-none flex-1 placeholder:text-gray-500"
          />
          {isLoading ? (
            <LoadingSpinner size="sm" className="flex-shrink-0" />
          ) : (
            <button onClick={onSearch} aria-label="검색">
              <SearchIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
