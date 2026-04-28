'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type HeatmapRow = { activity_date: string; cnt: number }

const CELL_COLORS = [
  'bg-border',         // 0
  'bg-primary/25',     // 1
  'bg-primary/50',     // 2
  'bg-primary/75',     // 3
  'bg-primary',        // 4+
]

function getCellColor(cnt: number): string {
  if (cnt === 0) return CELL_COLORS[0]
  if (cnt === 1) return CELL_COLORS[1]
  if (cnt === 2) return CELL_COLORS[2]
  if (cnt === 3) return CELL_COLORS[3]
  return CELL_COLORS[4]
}

function buildGrid(year: number, dataMap: Map<string, number>) {
  // 해당 연도 1월 1일 → 12월 31일, 일요일 시작 52~53주 그리드
  const jan1 = new Date(year, 0, 1)
  const startDay = jan1.getDay() // 0=Sun
  const totalDays = (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 366 : 365

  const cells: { date: string; cnt: number }[] = []
  // pad leading empty cells
  for (let i = 0; i < startDay; i++) cells.push({ date: '', cnt: 0 })

  for (let d = 0; d < totalDays; d++) {
    const date = new Date(year, 0, d + 1)
    const dateStr = date.toISOString().slice(0, 10)
    cells.push({ date: dateStr, cnt: dataMap.get(dateStr) ?? 0 })
  }

  // group into weeks (columns of 7)
  const weeks: { date: string; cnt: number }[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }
  return weeks
}

export function ActivityHeatmap({ userId }: { userId: string }) {
  const year = new Date().getFullYear()
  const [dataMap, setDataMap] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(true)
  const [tooltip, setTooltip] = useState<{ date: string; cnt: number } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .rpc('get_activity_heatmap', { p_user_id: userId, p_year: year })
      .then(({ data }) => {
        const map = new Map<string, number>()
        ;(data ?? []).forEach((row: HeatmapRow) => {
          map.set(row.activity_date.slice(0, 10), Number(row.cnt))
        })
        setDataMap(map)
        setLoading(false)
      })
  }, [userId, year])

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const weeks = buildGrid(year, dataMap)
  const totalCount = Array.from(dataMap.values()).reduce((a, b) => a + b, 0)

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-[3px]" style={{ minWidth: 'max-content' }}>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((cell, di) => (
                <button
                  key={di}
                  className={`w-[11px] h-[11px] rounded-sm transition-opacity ${
                    cell.date ? getCellColor(cell.cnt) : 'bg-transparent'
                  }`}
                  onMouseEnter={() => cell.date ? setTooltip(cell) : null}
                  onMouseLeave={() => setTooltip(null)}
                  aria-label={cell.date ? `${cell.date}: ${cell.cnt}개` : undefined}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && tooltip.date && (
        <p className="text-muted text-[11px]">
          {tooltip.date} — {tooltip.cnt > 0 ? `${tooltip.cnt}개 기록` : '기록 없음'}
        </p>
      )}

      <div className="flex items-center justify-between">
        <p className="text-muted text-[12px]">{year}년 총 {totalCount}개 기록</p>
        <div className="flex items-center gap-1">
          <span className="text-muted text-[10px]">적음</span>
          {CELL_COLORS.map((c, i) => (
            <div key={i} className={`w-[10px] h-[10px] rounded-sm ${c}`} />
          ))}
          <span className="text-muted text-[10px]">많음</span>
        </div>
      </div>
    </div>
  )
}
