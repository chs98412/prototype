# Story: 음반 리뷰 & 통계

**ID**: EP04-S03
**Epic**: EP04: 음악 평가 시스템
**Sprint**: 6
**Points**: 3
**Status**: Draft
**Assignee**: Developer, Designer
**Created**: 2026-05-12
**Updated**: 2026-05-12

---

## User Story

> As a **Music Listener**,
> I want to **write a review for an album and see aggregated statistics**,
> So that **I can share my overall thoughts and see how I engage with music**.

---

## Acceptance Criteria

- [ ] AC1: 음반 상세 페이지에 "리뷰 작성" 섹션 추가
- [ ] AC2: 리뷰 본문 입력 (텍스트, 최대 500자)
- [ ] AC3: 스포일러 마크 옵션 (곡 제목/가사 스포일러 방지)
- [ ] AC4: 리뷰 저장 시 track_reviews 테이블 업데이트
- [ ] AC5: 음반 통계 섹션 표시 (총 평가 곡 수, 평균 평점, 청취 일수)
- [ ] AC6: 기존 리뷰는 수정/삭제 가능
- [ ] AC7: 다른 사용자의 리뷰는 읽기 전용

---

## Technical Notes

### 음반 통계 계산

```sql
-- VIEW: 사용자 별 음반 통계
CREATE OR REPLACE VIEW user_album_stats AS
SELECT
  user_id,
  album_id,
  COUNT(DISTINCT track_id) as rated_tracks,
  COUNT(*) as total_records,
  ROUND(AVG(rating::numeric), 1) as avg_rating,
  COUNT(DISTINCT DATE(listened_at)) as listen_days,
  MAX(listened_at) as last_listened
FROM track_records
WHERE rating IS NOT NULL
GROUP BY user_id, album_id;
```

### 프론트엔드

```typescript
// components/music/AlbumReview.tsx
export function AlbumReview({ albumId, userId }: Props) {
  const [review, setReview] = useState<Review | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState('')
  const [hasSpoiler, setHasSpoiler] = useState(false)
  const [stats, setStats] = useState<AlbumStats | null>(null)

  const handleSaveReview = async () => {
    const { error } = await supabase.rpc('save_album_review', {
      album_id: albumId,
      content: content,
      has_spoiler: hasSpoiler
    })
    
    if (!error) {
      setIsEditing(false)
      setReview({ content, has_spoiler: hasSpoiler, updated_at: new Date() })
    }
  }

  const handleDeleteReview = async () => {
    const { error } = await supabase.rpc('delete_album_review', {
      album_id: albumId
    })
    
    if (!error) {
      setReview(null)
    }
  }

  return (
    <div className="album-review">
      {/* 통계 섹션 */}
      <div className="album-stats">
        <div className="stat">
          <span className="label">평가한 곡</span>
          <span className="value">{stats?.rated_tracks} / {stats?.total_tracks}</span>
        </div>
        <div className="stat">
          <span className="label">평균 평점</span>
          <span className="value">{stats?.avg_rating}/5</span>
        </div>
        <div className="stat">
          <span className="label">청취 일수</span>
          <span className="value">{stats?.listen_days}일</span>
        </div>
      </div>

      {/* 리뷰 섹션 */}
      <div className="review-section">
        {!isEditing && review ? (
          <div className="review-view">
            {review.has_spoiler && (
              <span className="spoiler-tag">스포일러</span>
            )}
            <p>{review.content}</p>
            <small>{formatDate(review.updated_at)}</small>
            <button onClick={() => setIsEditing(true)}>수정</button>
            <button onClick={handleDeleteReview}>삭제</button>
          </div>
        ) : (
          <div className="review-edit">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="이 음반의 느낌을 공유해주세요... (최대 500자)"
              maxLength={500}
            />
            <label>
              <input
                type="checkbox"
                checked={hasSpoiler}
                onChange={(e) => setHasSpoiler(e.target.checked)}
              />
              스포일러 포함
            </label>
            <button onClick={handleSaveReview}>리뷰 저장</button>
            <button onClick={() => setIsEditing(false)}>취소</button>
          </div>
        )}
      </div>
    </div>
  )
}
```

### RPC 함수

```sql
CREATE OR REPLACE FUNCTION save_album_review(
  p_album_id UUID,
  p_content TEXT,
  p_has_spoiler BOOLEAN
) RETURNS UUID AS $$
DECLARE
  v_review_id UUID;
BEGIN
  INSERT INTO track_reviews (
    user_id, album_id, track_id, content, rating, has_spoiler
  ) VALUES (
    auth.uid(),
    p_album_id,
    NULL, -- album 리뷰는 track_id가 NULL
    p_content,
    NULL, -- 별점은 track_records에서 자동 계산
    p_has_spoiler
  )
  ON CONFLICT (user_id, album_id) WHERE track_id IS NULL
  DO UPDATE SET content = p_content, has_spoiler = p_has_spoiler, updated_at = now()
  RETURNING id INTO v_review_id;

  RETURN v_review_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_album_review(p_album_id UUID)
RETURNS void AS $$
BEGIN
  DELETE FROM track_reviews
  WHERE user_id = auth.uid()
    AND album_id = p_album_id
    AND track_id IS NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_album_stats(p_user_id UUID, p_album_id UUID)
RETURNS TABLE (
  rated_tracks INT,
  total_tracks INT,
  avg_rating NUMERIC,
  listen_days INT,
  last_listened TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT track_id)::INT,
    (SELECT COUNT(*) FROM album_tracks WHERE album_id = p_album_id)::INT,
    ROUND(AVG(rating::numeric), 1),
    COUNT(DISTINCT DATE(listened_at))::INT,
    MAX(listened_at)
  FROM track_records
  WHERE user_id = p_user_id
    AND album_id = p_album_id;
END;
$$ LANGUAGE plpgsql;
```

---

## Dependencies

- EP04-S02: 곡 평가 시스템 완료

---

## Test Cases

| ID | Description | Expected Result | Status |
|---|---|---|---|
| TC01 | 리뷰 작성 후 저장 | track_reviews 저장, 화면에 표시 | Pending |
| TC02 | 리뷰 수정 | 업데이트, 타임스탬프 변경 | Pending |
| TC03 | 리뷰 삭제 | DB에서 제거 | Pending |
| TC04 | 다른 사용자 리뷰 조회 | 읽기만 가능 (수정/삭제 불가) | Pending |
| TC05 | 통계 계산 | 정확한 수치 표시 | Pending |
| TC06 | 스포일러 마크 | 리뷰 표시 시 "스포일러" 태그 표시 | Pending |

---

## Definition of Done

- [ ] AlbumReview 컴포넌트 구현
- [ ] RPC 함수 구현 (save, delete, stats)
- [ ] 통계 VIEW 검증
- [ ] UI 반응형 디자인
- [ ] 전체 통합 테스트
- [ ] 코드 푸시
- [ ] QA & PO 승인

---

## Blockers

[None]

---

## Dev Notes

[To be filled during implementation]
