const GENRE_NAMES: Record<number, string> = {
  28: '액션', 12: '모험', 16: '애니메이션', 35: '코미디', 80: '범죄',
  99: '다큐', 18: '드라마', 10751: '가족', 14: '판타지', 36: '역사',
  27: '공포', 10402: '음악', 9648: '미스터리', 10749: '로맨스',
  878: 'SF', 53: '스릴러', 10752: '전쟁', 37: '서부극',
  10759: '액션·어드벤처', 10762: '어린이', 10765: 'SF·판타지',
  10766: '연속극', 10768: '전쟁·정치',
}

const LEVEL_LABELS = ['데이터 부족', 'Lv.1', 'Lv.2', 'Lv.3', 'Lv.4', 'Lv.5']
const LEVEL_COLORS = [
  'bg-border text-muted',
  'bg-surface text-muted',
  'bg-primary/20 text-primary',
  'bg-primary/40 text-primary',
  'bg-primary/70 text-white',
  'bg-primary text-white',
]

type GenreRow = { genre_id: number; cnt: number; avg_rating: number; level: number }

interface GenreRatingsProps {
  ratings: GenreRow[]
}

export function GenreRatings({ ratings }: GenreRatingsProps) {
  if (ratings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <span className="text-3xl">🎭</span>
        <p className="text-muted text-sm">기록을 남기면 취향 레이팅이 생성돼요</p>
      </div>
    )
  }

  const withData = ratings.filter((r) => r.level > 0)
  const top3 = withData.slice(0, 3)

  return (
    <div className="flex flex-col gap-4">
      {/* Top 3 badges */}
      {top3.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {top3.map((r) => (
            <span
              key={r.genre_id}
              className={`px-3 py-1.5 rounded-full text-[13px] font-semibold ${LEVEL_COLORS[r.level]}`}
            >
              {GENRE_NAMES[r.genre_id] ?? `장르 ${r.genre_id}`} · {LEVEL_LABELS[r.level]}
            </span>
          ))}
        </div>
      )}

      {/* Full list */}
      <div className="flex flex-col gap-2">
        {ratings.map((r) => {
          const name = GENRE_NAMES[r.genre_id] ?? `장르 ${r.genre_id}`
          const pct = r.level === 0 ? 0 : Math.round((r.level / 5) * 100)
          return (
            <div key={r.genre_id} className="flex items-center gap-3">
              <span className="text-text text-[13px] w-[80px] flex-shrink-0 truncate">{name}</span>
              <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className={`text-[11px] w-[60px] text-right flex-shrink-0 ${r.level === 0 ? 'text-muted' : 'text-primary font-medium'}`}>
                {r.level === 0 ? '부족' : LEVEL_LABELS[r.level]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
