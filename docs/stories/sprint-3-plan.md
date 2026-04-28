# Sprint 3 계획

**기간**: 2026-04-28 ~
**목표**: 필모그래피 컬렉션 + EP03 소셜 기능 전체
**총 포인트**: 12pt

---

## 스토리 목록

| ID | 스토리 | 포인트 | 상태 | 의존 |
|---|---|---|---|---|
| EP02-S04 | 필모그래피 컬렉션 (감독/배우별 모아보기) | 3pt | Approved | EP01-S03 |
| EP03-S01 | 팔로우/팔로워 시스템 | 3pt | Approved | EP01-S01 |
| EP03-S02 | 친구 활동 피드 | 3pt | Approved | EP03-S01 |
| EP03-S03 | 취향 레이팅 (장르별 Lv.) | 3pt | Approved | EP01-S04 |

---

## 진행 순서

```
EP02-S04 (필모그래피)     EP03-S01 (팔로우)
                              ↓
                         EP03-S02 (피드)
                         EP03-S03 (취향 레이팅)
```

---

## 기술 포인트

- 필모그래피: TMDB `/person/{id}/movie_credits` API 활용
- 팔로우: `user_follows` 테이블 (follower_id, following_id)
- 피드: `user_records` + `user_follows` JOIN, 최신순 정렬
- 취향 레이팅: 유저 기록의 장르별 평점 평균 + 기록 수 → Lv. 산출
