# Story: 음악 히트맵 & 통계 대시보드

**ID**: EP04-S04
**Epic**: EP04: 음악 평가 시스템
**Sprint**: 6
**Points**: 5
**Status**: Draft
**Assignee**: Developer, Designer
**Created**: 2026-05-12
**Updated**: 2026-05-12

---

## User Story

> As a **Music Listener**,
> I want to **see my music listening activity on a heatmap and detailed statistics**,
> So that **I can visualize my music engagement patterns over time**.

---

## Acceptance Criteria

- [ ] AC1: 음악 히트맵 구현 (365일 × 7요일 그리드, 색상 강도 = 활동량)
- [ ] AC2: 년도 선택 가능 (전년도 포함)
- [ ] AC3: 월별 통계 섹션 (평가 곡 수, 평균 평점, 청취 일수)
- [ ] AC4: 연간 통계 (총 음반 수, 총 곡 평가, 총 시간)
- [ ] AC5: 히트맵 셀 클릭 시 해당 날짜의 곡목 표시
- [ ] AC6: 모바일 반응형 (하단 스크롤 가능)

---

## Technical Notes

### 백엔드 RPC

```sql
CREATE OR REPLACE FUNCTION get_music_heatmap(p_user_id UUID, p_year INT)
RETURNS TABLE (
  date DATE,
  count INT,
  rating_avg NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(listened_at)::DATE,
    COUNT(*)::INT,
    ROUND(AVG(rating::numeric), 1)
  FROM track_records
  WHERE user_id = p_user_id
    AND EXTRACT(YEAR FROM listened_at) = p_year
  GROUP BY DATE(listened_at)
  ORDER BY date;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_music_stats(p_user_id UUID, p_year INT)
RETURNS TABLE (
  total_albums INT,
  total_tracks_rated INT,
  avg_rating NUMERIC,
  listen_days INT,
  max_rating_day DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT album_id)::INT,
    COUNT(*)::INT,
    ROUND(AVG(rating::numeric), 1),
    COUNT(DISTINCT DATE(listened_at))::INT,
    (SELECT DATE(listened_at) FROM track_records
     WHERE user_id = p_user_id AND EXTRACT(YEAR FROM listened_at) = p_year
     GROUP BY DATE(listened_at)
     ORDER BY COUNT(*) DESC
     LIMIT 1)
  FROM track_records
  WHERE user_id = p_user_id
    AND EXTRACT(YEAR FROM listened_at) = p_year;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_music_by_date(p_user_id UUID, p_date DATE)
RETURNS TABLE (
  album_title TEXT,
  track_title TEXT,
  rating INT,
  listened_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    albums.title,
    album_tracks.title,
    track_records.rating,
    track_records.listened_at
  FROM track_records
  JOIN album_tracks ON track_records.track_id = album_tracks.id
  JOIN albums ON track_records.album_id = albums.id
  WHERE track_records.user_id = p_user_id
    AND DATE(track_records.listened_at) = p_date
  ORDER BY track_records.listened_at;
END;
$$ LANGUAGE plpgsql;
```

### 프론트엔드

```typescript
// components/music/MusicHeatmap.tsx
export function MusicHeatmap() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [heatmapData, setHeatmapData] = useState<HeatmapDay[]>([])
  const [stats, setStats] = useState<MusicStats | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [dayTracks, setDayTracks] = useState<Track[]>([])

  useEffect(() => {
    loadHeatmapData()
  }, [year])

  const handleCellClick = async (date: Date) => {
    const { data } = await supabase.rpc('get_music_by_date', {
      p_date: date
    })
    setSelectedDate(date)
    setDayTracks(data)
  }

  const generateGrid = () => {
    const days = []
    for (let i = 0; i < 365; i++) {
      const date = new Date(year, 0, 1)
      date.setDate(date.getDate() + i)
      const dayData = heatmapData.find(d => d.date === date)
      days.push({
        date,
        count: dayData?.count || 0,
        rating: dayData?.rating_avg || 0
      })
    }
    return days
  }

  return (
    <div className="music-stats">
      {/* 년도 선택 */}
      <div className="year-selector">
        <button onClick={() => setYear(year - 1)}>← 이전</button>
        <span>{year}</span>
        <button onClick={() => setYear(year + 1)}>다음 →</button>
      </div>

      {/* 히트맵 */}
      <div className="heatmap-container">
        <h3>{year}년 음악 활동</h3>
        <div className="heatmap-grid">
          {generateGrid().map((day, idx) => (
            <div
              key={idx}
              className="heatmap-cell"
              style={{
                backgroundColor: getHeatColor(day.count),
                opacity: day.count > 0 ? 1 : 0.1
              }}
              onClick={() => handleCellClick(day.date)}
              title={`${day.date.toLocaleDateString()}: ${day.count}곡 (평점 ${day.rating})`}
            />
          ))}
        </div>
      </div>

      {/* 통계 */}
      <div className="stats-section">
        <h3>년도 통계</h3>
        <div className="stats-grid">
          <div className="stat">
            <span className="label">음반 수</span>
            <span className="value">{stats?.total_albums}</span>
          </div>
          <div className="stat">
            <span className="label">평가 곡</span>
            <span className="value">{stats?.total_tracks_rated}</span>
          </div>
          <div className="stat">
            <span className="label">평균 평점</span>
            <span className="value">{stats?.avg_rating}/5</span>
          </div>
          <div className="stat">
            <span className="label">활동 일수</span>
            <span className="value">{stats?.listen_days}일</span>
          </div>
        </div>
      </div>

      {/* 선택된 날짜의 곡 */}
      {selectedDate && dayTracks.length > 0 && (
        <div className="day-details">
          <h4>{selectedDate.toLocaleDateString()} - {dayTracks.length}곡</h4>
          <div className="tracks-list">
            {dayTracks.map((track, idx) => (
              <div key={idx} className="track-item">
                <span>{track.album_title} - {track.track_title}</span>
                <span className="rating">★ {track.rating}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## Dependencies

- EP04-S02: 곡 평가 시스템 완료

---

## Test Cases

| ID | Description | Expected Result | Status |
|---|---|---|---|
| TC01 | 현재 년도 히트맵 로드 | 365일 그리드 표시 | Pending |
| TC02 | 활동이 있는 날 셀 색상 | 강도 차이 표시 | Pending |
| TC03 | 셀 클릭 시 상세 | 해당 날짜의 곡목 표시 | Pending |
| TC04 | 년도 변경 | 히트맵 업데이트 | Pending |
| TC05 | 통계 정확성 | 수치 검증 | Pending |
| TC06 | 모바일 반응형 | 스크롤 가능 | Pending |

---

## Definition of Done

- [ ] MusicHeatmap 컴포넌트 구현
- [ ] RPC 함수 3개 구현 및 테스트
- [ ] 히트맵 색상 정의 (강도 레벨 5단계 이상)
- [ ] 모바일 UI 테스트
- [ ] 성능 최적화 (쿼리 인덱싱)
- [ ] 코드 푸시
- [ ] QA & PO 승인

---

## Blockers

[None]

---

## Dev Notes

[To be filled during implementation]
