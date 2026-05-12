# Story: 음반 컬렉션 (아티스트별 모아보기)

**ID**: EP04-S07
**Epic**: EP04: 음악 평가 시스템
**Sprint**: 8
**Points**: 5
**Status**: Draft

---

## User Story

> As a **Music Listener**,
> I want to **browse my albums organized by artist**,
> So that **I can see my collection and discover new music from favorite artists**.

---

## Acceptance Criteria

- [ ] AC1: "음반 컬렉션" 페이지 (`/music/collection`)
- [ ] AC2: 아티스트별 그룹핑 + 해당 음반 목록
- [ ] AC3: 각 음반 카드: 이미지, 제목, 평균 평점, 평가 진행도
- [ ] AC4: 정렬 옵션: 아티스트명, 평점, 최신 추가
- [ ] AC5: 아티스트 클릭 시 해당 음반만 필터링
- [ ] AC6: 음반 클릭 시 상세 페이지로 이동
- [ ] AC7: "음반 제거" 기능 (아카이브 또는 삭제)

---

## Technical Notes

```sql
CREATE OR REPLACE VIEW user_music_collection AS
SELECT
  albums.id,
  albums.title,
  albums.artist,
  albums.image_url,
  albums.release_date,
  COUNT(DISTINCT track_records.track_id) as rated_tracks,
  COUNT(DISTINCT album_tracks.id) as total_tracks,
  ROUND(AVG(track_records.rating::numeric), 1) as avg_rating,
  MAX(track_records.created_at) as last_rated
FROM albums
LEFT JOIN album_tracks ON albums.id = album_tracks.album_id
LEFT JOIN track_records ON album_tracks.id = track_records.track_id
WHERE track_records.user_id = auth.uid() OR track_records.user_id IS NULL
GROUP BY albums.id, albums.title, albums.artist, albums.image_url, albums.release_date
ORDER BY albums.artist, albums.title;
```

---

## Dependencies

- EP04-S02: 곡 평가 완료
- EP04-S01: 음반 검색 완료

---

## Definition of Done

- [ ] AlbumCollection 페이지 구현
- [ ] 아티스트별 그룹핑 UI
- [ ] 정렬 기능
- [ ] 음반 제거 기능
- [ ] 모바일 반응형
- [ ] 코드 푸시
- [ ] PO 승인
