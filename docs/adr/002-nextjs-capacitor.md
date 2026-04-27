# ADR-002: Next.js + Capacitor 프론트엔드/모바일 전략

**Date**: 2026-04-27
**Status**: Accepted

## Context
모바일 퍼스트 웹앱으로 시작하되, 추후 iOS/Android 앱으로 포팅 가능해야 함.
후보: React Native, Expo, Next.js + Capacitor

## Decision
Next.js 14 (App Router) + Capacitor 채택.

## Rationale
- React Native: 번들 크기 크고 빌드 환경 복잡, 웹과 컴포넌트 모델 다름
- Expo: React Native 기반으로 동일한 단점
- Capacitor: 기존 Next.js 웹앱을 그대로 래핑 → 코드 변경 최소, 앱스토어 배포 가능

## Consequences
- 장점: 코드베이스 하나로 웹 + iOS + Android 대응, 전환 비용 최소
- 단점: 완전한 네이티브 앱 대비 성능 약간 열세 (이 서비스 특성상 문제없음)
