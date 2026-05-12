# Story: 음악 취향 분석 (장르별)

**ID**: EP04-S05
**Epic**: EP04: 음악 평가 시스템
**Sprint**: 7
**Points**: 3
**Status**: Draft

---

## User Story

> As a **Music Listener**,
> I want to **see my genre preferences and rating patterns**,
> So that **I can understand my music taste better**.

---

## Acceptance Criteria

- [ ] AC1: 선호 장르 목록 (albums.genres 기반)
- [ ] AC2: 각 장르별 평균 평점 + 곡 개수 표시
- [ ] AC3: 장르 클릭 시 해당 음반 목록 표시
- [ ] AC4: 상위 5개 장르 강조 표시
- [ ] AC5: 취향 계산: (평점 5점 곡 수) / (전체 곡 수) × 100

---

## Technical Notes

```sql
CREATE OR REPLACE FUNCTION get_genre_ratings(p_user_id UUID)
RETURNS TABLE (
  genre TEXT,
  total_ratings INT,
  avg_rating NUMERIC,
  album_count INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    genre,
    COUNT(*)::INT,
    ROUND(AVG(track_records.rating::numeric), 1),
    COUNT(DISTINCT track_records.album_id)::INT
  FROM track_records
  JOIN albums ON track_records.album_id = albums.id,
  LATERAL UNNEST(albums.genres) AS genre
  WHERE track_records.user_id = p_user_id
  GROUP BY genre
  ORDER BY avg_rating DESC, count(*) DESC;
END;
$$ LANGUAGE plpgsql;
```

---

## Dependencies

- EP04-S02: 곡 평가 완료
- EP04-S04: 통계 기초

---

## Definition of Done

- [ ] GenreAnalysis 컴포넌트 구현
- [ ] RPC 함수 구현 및 테스트
- [ ] UI 반응형 설계
- [ ] 코드 푸시
- [ ] QA 승인
