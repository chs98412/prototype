'use client'

interface AlbumStats {
  ratedTracks: number
  totalTracks: number
  avgRating: number
  listenDays: number
  lastListened?: Date
}

interface AlbumStatsCardsProps {
  stats: AlbumStats
}

function StatCard({ label, value, unit = '' }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-center">
      <div className="text-2xl font-bold text-gray-900">
        {value}{unit}
      </div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  )
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}.${month}.${day} ${hours}:${minutes}`
}

export default function AlbumStatsCards({ stats }: AlbumStatsCardsProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">음악 통계</h2>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          <StatCard label="평가 곡" value={`${stats.ratedTracks}/${stats.totalTracks}`} />
          <StatCard label="평균 평점" value={stats.avgRating.toFixed(1)} unit="/5" />
          <StatCard label="청취 일수" value={stats.listenDays} unit="일" />
          {stats.lastListened && (
            <StatCard
              label="마지막 청취"
              value={formatDate(stats.lastListened)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
