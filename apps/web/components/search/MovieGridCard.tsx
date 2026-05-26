import Link from 'next/link'
import Image from 'next/image'

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

interface MovieGridCardProps {
  item: SearchResult
}

function MetaText({ year, genre, language }: { year?: string; genre?: string; language?: string }) {
  const parts = [year, genre, language].filter(Boolean)
  return <span>{parts.join(' · ')}</span>
}

export default function MovieGridCard({ item }: MovieGridCardProps) {
  return (
    <Link href={`/content/${item.type}/${item.id}`} className="flex flex-col active:opacity-70 transition-opacity">
      <div className="relative w-full rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow" style={{ aspectRatio: '9/16' }}>
        {item.poster ? (
          <Image src={item.poster} alt={item.title} fill className="object-cover" sizes="50vw" />
        ) : (
          <div className="w-full h-full bg-gray-300" />
        )}
      </div>
      <div className="mt-1.5 px-0.5">
        <p className="text-gray-900 font-semibold text-[13px] leading-snug line-clamp-1">{item.title}</p>
        <p className="text-gray-500 text-[11px] mt-0.5">
          <MetaText year={item.year} genre={item.genre} language={item.language} />
        </p>
      </div>
    </Link>
  )
}
