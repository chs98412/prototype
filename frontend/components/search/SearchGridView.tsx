import MovieGridCard from './MovieGridCard'

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

interface SearchGridViewProps {
  results: SearchResult[]
}

export default function SearchGridView({ results }: SearchGridViewProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 md:gap-x-3 gap-y-4 md:gap-y-5 px-4 pt-4">
      {results.map((item) => (
        <MovieGridCard key={`${item.type}-${item.id}`} item={item} />
      ))}
    </div>
  )
}
