'use client'

import Link from 'next/link'

interface BottomNavProps {
  active: 'home' | 'search' | 'music' | 'profile'
}

function HomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function MusicIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13a4 4 0 1 1-4 4 4 4 0 0 1 4-4" />
      <circle cx="6" cy="21" r="2" />
    </svg>
  )
}

const tabs = [
  { id: 'home' as const, href: '/home', Icon: HomeIcon },
  { id: 'search' as const, href: '/search', Icon: SearchIcon },
  { id: 'music' as const, href: '/music/search', Icon: MusicIcon },
  { id: 'profile' as const, href: '/profile', Icon: ProfileIcon },
]

export function BottomNav({ active }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-14 bg-background border-t border-border flex items-center justify-around px-4 z-50">
      {tabs.map(({ id, href, Icon }) => {
        const isActive = active === id
        return (
          <Link
            key={id}
            href={href}
            className={`flex items-center justify-center min-w-[64px] py-1 transition-colors ${isActive ? 'text-text' : 'text-muted'}`}
          >
            <Icon />
          </Link>
        )
      })}
    </nav>
  )
}
