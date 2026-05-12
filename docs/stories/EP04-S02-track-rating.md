# Story: 곡 평가 시스템

**ID**: EP04-S02
**Epic**: EP04: 음악 평가 시스템
**Sprint**: 5
**Points**: 5
**Status**: Draft
**Assignee**: Developer, Designer
**Created**: 2026-05-12
**Updated**: 2026-05-12

---

## User Story

> As a **Music Listener**,
> I want to **rate individual tracks and see automatic album ratings**,
> So that **I can keep detailed music preferences and get album ratings based on track ratings**.

---

## Acceptance Criteria

- [ ] AC1: 음반 상세 페이지에서 각 곡별 별점 입력 UI (1-5점)
- [ ] AC2: 곡 평가 저장 시 DB에 track_records 테이블 업데이트
- [ ] AC3: 자동 계산: 음반 평점 = 해당 음반의 모든 곡 평점 평균
- [ ] AC4: 음반 상단에 자동 계산된 평점 표시
- [ ] AC5: 이미 평가한 곡은 별점 표시 유지
- [ ] AC6: "곡 리뷰" 작성 옵션 추가 (영화 리뷰처럼)
- [ ] AC7: 모든 평가는 타임스탬프 기록 (청취 시간)

---

## Technical Notes

### 프론트엔드 구조

```typescript
// components/music/AlbumDetail.tsx
export function AlbumDetail({ albumId }: Props) {
  const [album, setAlbum] = useState<Album | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [ratings, setRatings] = useState<Map<UUID, number>>(new Map())
  const [albumRating, setAlbumRating] = useState<number>(0)

  useEffect(() => {
    // 음반 상세 + 곡목 + 기존 평가 로드
    loadAlbumData()
  }, [albumId])

  const handleRateTrack = async (trackId: UUID, rating: number) => {
    const { error } = await supabase.rpc('rate_track', {
      track_id: trackId,
      rating: rating,
      listened_at: new Date()
    })
    
    if (!error) {
      setRatings(prev => new Map(prev).set(trackId, rating))
      updateAlbumRating()
    }
  }

  const updateAlbumRating = () => {
    const ratings_array = Array.from(ratings.values())
    const avg = ratings_array.reduce((a, b) => a + b, 0) / ratings_array.length
    setAlbumRating(Math.round(avg * 10) / 10)
  }

  return (
    <div>
      {/* 음반 헤더 */}
      <div className="album-header">
        <img src={album?.image_url} />
        <h1>{album?.title}</h1>
        <p>{album?.artist}</p>
        <div className="album-rating">
          <Star rating={albumRating} /> {albumRating}/5.0
        </div>
      </div>

      {/* 곡 목록 */}
      <div className="tracks">
        {tracks.map((track) => (
          <TrackRating
            key={track.id}
            track={track}
            currentRating={ratings.get(track.id)}
            onRate={(rating) => handleRateTrack(track.id, rating)}
          />
        ))}
      </div>
    </div>
  )
}

// components/music/TrackRating.tsx
export function TrackRating({ track, currentRating, onRate }: Props) {
  return (
    <div className="track-item">
      <div className="track-info">
        <span className="track-number">{track.track_number}</span>
        <div>
          <h4>{track.title}</h4>
          <p className="artist">{track.artist}</p>
          <p className="duration">{formatDuration(track.duration_ms)}</p>
        </div>
      </div>
      <div className="track-rating">
        <StarInput
          rating={currentRating || 0}
          onChange={onRate}
        />
      </div>
    </div>
  )
}
```

### Backend RPC 함수

```sql
CREATE OR REPLACE FUNCTION rate_track(
  p_track_id UUID,
  p_rating INT,
  p_listened_at TIMESTAMP
) RETURNS UUID AS $$
DECLARE
  v_record_id UUID;
BEGIN
  -- track_records 테이블에 기록 저장
  INSERT INTO track_records (user_id, track_id, album_id, rating, listened_at)
  SELECT 
    auth.uid(),
    p_track_id,
    album_tracks.album_id,
    p_rating,
    p_listened_at
  FROM album_tracks
  WHERE album_tracks.id = p_track_id
  RETURNING id INTO v_record_id;

  RETURN v_record_id;
EXCEPTION WHEN OTHERS THEN
  -- 중복된 (user, track, listened_at)에 대해 UPDATE
  UPDATE track_records
  SET rating = p_rating, updated_at = now()
  WHERE user_id = auth.uid()
    AND track_id = p_track_id
    AND DATE(listened_at) = DATE(p_listened_at)
  RETURNING id INTO v_record_id;

  RETURN v_record_id;
END;
$$ LANGUAGE plpgsql;

-- 음반 평점 자동 계산 (VIEW)
CREATE OR REPLACE VIEW album_ratings AS
SELECT
  user_id,
  album_id,
  ROUND(AVG(rating::numeric), 1) as avg_rating,
  COUNT(*) as rated_tracks,
  MAX(listened_at) as last_rated
FROM track_records
WHERE rating IS NOT NULL
GROUP BY user_id, album_id;
```

### DB 자동 계산

```sql
-- 트리거: track_reviews 추가 시 자동 계산
CREATE OR REPLACE FUNCTION update_album_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- track_records 변경 시마다 album_ratings 업데이트
  -- (VIEW이므로 자동 계산됨)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_track_rating_change
AFTER INSERT OR UPDATE ON track_records
FOR EACH ROW
EXECUTE FUNCTION update_album_stats();
```

### UI 스펙

- **음반 상세 페이지**: `/music/albums/[albumId]`
- **곡 목록**: 테이블 형식 (번호, 제목, 아티스트, 재생시간, 별점)
- **별점**: 1-5 클릭식 (이미 평가했으면 강조 표시)
- **자동 계산**: 평가 저장 직후 음반 평점 업데이트 (리얼타임)
- **색상**: 영화와 동일 (노란색 별)

---

## Dependencies

- EP04-S00: 기초 세팅 완료
- EP04-S01: 음반 검색 완료
- Designer: UI 별점 스타일 제공

---

## Test Cases

| ID | Description | Expected Result | Status |
|---|---|---|---|
| TC01 | 곡 1개에 5점 평가 | album_rating = 5.0 | Pending |
| TC02 | 같은 곡 다시 평가 (3점) | track_records 업데이트 (덮어씌우기), 중복 생성 안됨 | Pending |
| TC03 | 3곡 평가 (4, 5, 3점) | album_rating = 4.0 | Pending |
| TC04 | 모바일에서 별 터치 | 별점 입력 가능, UX 이상 없음 | Pending |
| TC05 | 청취 시간 기록 | listened_at 타임스탬프 저장됨 | Pending |
| TC06 | 곡 리뷰 작성 | track_reviews에 저장됨 | Pending |

---

## Definition of Done

- [ ] AlbumDetail, TrackRating 컴포넌트 구현
- [ ] rate_track RPC 함수 구현 및 테스트
- [ ] album_ratings VIEW 생성 및 검증
- [ ] 자동 계산 로직 테스트 (정확성)
- [ ] 모바일 UI 테스트
- [ ] 곡 리뷰 작성 기능 (별도 모달 또는 폼)
- [ ] 전체 통합 테스트 통과
- [ ] 코드 푸시
- [ ] QA & PO 승인

---

## Blockers

[None]

---

## Dev Notes

[To be filled during implementation]
