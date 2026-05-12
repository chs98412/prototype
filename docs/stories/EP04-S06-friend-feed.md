# Story: 친구 활동 피드 (음악 통합)

**ID**: EP04-S06
**Epic**: EP04: 음악 평가 시스템
**Sprint**: 7
**Points**: 3
**Status**: Draft

---

## User Story

> As a **User**,
> I want to **see my friends' music activity in my feed**,
> So that **I can discover new music through friends' listening patterns**.

---

## Acceptance Criteria

- [ ] AC1: FriendFeed 컴포넌트에 음악 활동 추가
- [ ] AC2: "음반 평가", "곡 평가", "리뷰 작성" 활동 표시
- [ ] AC3: 음악 활동 카드에 앨범 이미지, 평점, 타임스탐프 표시
- [ ] AC4: 클릭 시 해당 음반 상세 페이지로 이동

---

## Technical Notes

```sql
CREATE OR REPLACE FUNCTION get_friend_music_activity(p_user_id UUID, p_limit INT DEFAULT 20)
RETURNS TABLE (
  activity_type TEXT,
  friend_id UUID,
  friend_username TEXT,
  album_id UUID,
  album_title TEXT,
  album_image TEXT,
  track_title TEXT,
  rating INT,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    'track_rated'::TEXT,
    track_records.user_id,
    users.username,
    albums.id,
    albums.title,
    albums.image_url,
    album_tracks.title,
    track_records.rating,
    track_records.created_at
  FROM track_records
  JOIN users ON track_records.user_id = users.id
  JOIN album_tracks ON track_records.track_id = album_tracks.id
  JOIN albums ON track_records.album_id = albums.id
  JOIN follows ON track_records.user_id = follows.following_id
  WHERE follows.follower_id = p_user_id
  ORDER BY track_records.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
```

---

## Dependencies

- EP04-S02: 곡 평가 완료
- EP03-S01: 팔로우 시스템 완료

---

## Definition of Done

- [ ] FriendFeed에 음악 활동 타입 추가
- [ ] 음악 활동 카드 UI 구현
- [ ] RPC 함수 구현
- [ ] 통합 테스트
- [ ] 코드 푸시
- [ ] PO 승인
