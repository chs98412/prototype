# 🧩 Components 컴포넌트 도감

> 모든 React 컴포넌트를 분류하여 정리합니다.

---

## 📂 컴포넌트 카테고리

### 🎬 콘텐츠 컴포넌트

컨텐츠(영화/드라마) 관련 UI:

- **MovieDetailHeader** - 포스터 + 제목 + 메타 정보
- **MovieDetailInfo** - 줄거리, 감독, 출연진
- **MovieCard** - 작품 카드 (썸네일)
- **MovieGridCard** - 그리드 뷰 카드

### 🔔 알림 컴포넌트

사용자 활동 알림:

- **NotificationFeed** - 알림 피드 메인
- **NotificationItem** - 개별 알림 아이템

### 🔍 검색 컴포넌트

검색 기능 관련:

- **SearchGridView** - 검색 결과 그리드
- **SearchListView** - 검색 결과 리스트 (선택)
- **SearchBar** - 검색 입력창

### 📱 피드 컴포넌트

사용자 활동 피드:

- **EditorialReviewFeed** - 에디토리얼 스타일 피드
- **FriendFeed** - 친구 활동 피드
- **FeedItem** - 피드 개별 아이템

### 👤 프로필 컴포넌트

사용자 프로필 관련:

- **ProfileHeader** - 프로필 헤더 (아바타, 이름)
- **FollowButton** - 팔로우 버튼
- **ActivityHeatmap** - 활동 히트맵
- **GenreRatings** - 장르별 취향 평점
- **TasteMatch** - 취향 호환도
- **YearlyGoal** - 연간 목표

### 🎮 게임화 컴포넌트

게임화 요소:

- **StreakWidget** - 스트릭 카운터
- **ChallengeCatalog** - 도전과제 목록
- **ChallengeCard** - 도전과제 카드

### 🎬 배우/감독 컴포넌트

배우/감독 관련:

- **Filmography** - 필모그래피 목록
- **FilmographyCard** - 필모그래피 카드

### 📚 기타 컴포넌트

레이아웃, 유틸리티 등:

- **Header** - 페이지 헤더
- **TabNavigation** - 탭 네비게이션
- **BottomNavigation** - 하단 네비게이션
- **LoadingSpinner** - 로딩 인디케이터

---

## 📊 컴포넌트 통계

| 카테고리 | 개수 |
|---------|------|
| 콘텐츠 | 4 |
| 알림 | 2 |
| 검색 | 3 |
| 피드 | 3 |
| 프로필 | 6 |
| 게임화 | 3 |
| 배우/감독 | 2 |
| 기타 | 4 |
| **총계** | **27** |

---

## 🔗 원본 코드

- **[Frontend 폴더](../../../frontend/)** - 전체 소스
- **[Components 폴더](../../../frontend/components/)** - 컴포넌트 코드

---

## 💡 사용 팁

- 각 카테고리별로 구성된 폴더 구조 확인
- 컴포넌트 재사용성을 위해 props 문서 참조
- Tailwind CSS 클래스 스타일링 사용

