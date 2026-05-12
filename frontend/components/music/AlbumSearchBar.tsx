'use client'

import { useState } from 'react'

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted flex-shrink-0">
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
  isLoading: boolean
}

export default function AlbumSearchBar({ query, onQueryChange, isLoading }: AlbumSearchBarProps) {
  return (
    <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
      <div className="flex items-center gap-3">
        <button className="flex-shrink-0 text-gray-900 hover:text-gray-700">
          <BackArrowIcon />
        </button>

        <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
          <SearchIcon />
          <input
            type="text"
            placeholder="음반 또는 아티스트..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            disabled={isLoading}
            className="bg-transparent text-sm outline-none flex-1 placeholder:text-gray-500"
          />
          {isLoading && (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          )}
        </div>
      </div>
    </div>
  )
}
