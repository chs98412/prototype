# ADR-004: TMDB API + Redis 캐싱 전략

**Date**: 2026-04-27
**Status**: Accepted

## Context
글로벌 영화·시리즈·예능 데이터가 필요. 자체 콘텐츠 DB 구축은 비용/운영 부담이 큼.

## Decision
TMDB API를 콘텐츠 데이터 소스로 사용, Upstash Redis로 응답 캐싱.

## Rationale
- TMDB: 무료, 글로벌 콘텐츠 커버리지 우수, 한국어 지원
- Rate limit(40 req/10s) 대응 및 응답속도 개선을 위해 Redis 캐싱 필수
- 캐시 TTL: 영화 상세 24h, 검색 결과 1h

## Consequences
- 장점: 콘텐츠 DB 직접 구축/운영 불필요, 무료
- 단점: TMDB 서비스 장애 시 콘텐츠 조회 영향, 라이선스 조건 준수 필요 (비상업적 또는 Attribution 표시)
