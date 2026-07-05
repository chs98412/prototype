# 피드 화면에서 타입별 필터 칩 제거

모든 평가 타입(에세이/한줄평/인용/로그)을 단일 '평가' 개념으로 통일하면서
`apps/web/src/pages/FeedPage.tsx`에서 필터 관련 코드를 전부 제거했습니다.

- `FILTERS` 상수 및 `Filter` 타입 삭제
- `filter` state 및 `setFilter` 삭제
- 필터 칩 UI 섹션 삭제 (스크롤 가능한 버튼 행)
- `filtered` 변수 삭제 → `items`를 직접 렌더링
