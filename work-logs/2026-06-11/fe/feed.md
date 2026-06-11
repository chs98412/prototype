# 피드 화면을 에디토리얼 매거진 스타일로 구현

Claude Design 핸드오프 번들(logged. 앱)을 바탕으로 피드 화면을 새로 구현했습니다. Noto Serif KR 폰트와 올리브 액센트(#6a7040)를 적용하고, 카드 타입별로 컴포넌트를 분리했습니다.

- `src/app/(tabs)/index.tsx` 신규 생성 — 피드 화면 (마스트헤드, 필터 칩, 날짜 구분선, 카드 목록)
- `src/app/(tabs)/_layout.tsx` 신규 생성 — 4탭 레이아웃 (홈/검색/알림/프로필)
- `src/app/_layout.tsx` 신규 생성 — 루트 스택 레이아웃, NotoSerifKR 폰트 로딩
- `src/components/cards/DayDivider.tsx` 신규 생성 — 날짜 구분선 컴포넌트
- `src/components/cards/EssayCard.tsx` 신규 생성 — 에세이 카드
- `src/components/cards/RatingCard.tsx` 신규 생성 — 한줄평 카드
- `src/components/cards/LogCard.tsx` 신규 생성 — 로그 카드
- `src/components/cards/QuoteCard.tsx` 신규 생성 — 인용 카드
- `src/components/cards/ListCard.tsx` 신규 생성 — 컬렉션 카드
- `src/components/ui/Icons.tsx` 신규 생성 — Ionicons 래퍼 컴포넌트들
- `src/components/ui/Avatar.tsx` 신규 생성 — 프로필 아바타
- `src/components/ui/Poster.tsx` 신규 생성 — 영화 포스터
- `src/components/ui/Pill.tsx` 신규 생성 — 필터 칩
- `src/components/ui/Stars.tsx` 신규 생성 — 별점 컴포넌트
- `src/components/ui/TypeBadge.tsx` 신규 생성 — 포스트 타입 배지
- `src/components/ui/SectionLabel.tsx` 신규 생성 — 섹션 레이블
- `src/components/ui/SubHeader.tsx` 신규 생성 — 서브 헤더 (백 버튼 + 타이틀 + 트레일링)
- `src/lib/design.ts` 신규 생성 — Colors, Font 디자인 토큰
- `src/lib/data.ts` 신규 생성 — 전체 목 데이터 (MOVIES, ESSAYS, FEED_ITEMS, FOLLOWS, ME 등)
- `src/lib/images.ts` 신규 생성 — 이미지 require() 매핑
- `assets/images/` 이미지 에셋 11개 추가
