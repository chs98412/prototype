# 로그 기록 상세 페이지 추가 및 피드 네비게이션 수정

피드에서 로그(log) 항목을 탭했을 때 영화 상세 페이지로 이동하던 문제를 수정하고, 로그 전용 상세 페이지를 PostPage에 구현했습니다.

- `apps/web/src/pages/FeedPage.tsx`: EvalCard의 로그 항목 네비게이션을 `/movie/:tmdb_id` → `/post/record/:id`로 변경
- `apps/web/src/pages/PostPage.tsx`: `RecordDTO` import 추가, `record` 상태 및 `/v1/records/:id` fetch 로직 추가, `kind === 'record'` 상세 뷰 렌더링 블록 추가 (포스터 210×290, 영화 제목, 별점, "멘트 없이 기록됨")
