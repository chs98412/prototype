# ADR-001: Go + Gin 백엔드 선택

**Date**: 2026-04-27
**Status**: Accepted

## Context
혼자 개발하는 프로젝트. 개발 비용(시간)과 인프라 비용을 최소화해야 함.
후보: Python(FastAPI), Go, Kotlin

## Decision
Go + Gin 채택.

## Rationale
- Kotlin: JVM 메모리 오버헤드로 인프라 비용 높음 → 제외
- Python vs Go: 월 인프라 비용 차이 ~$5 수준이나, Go의 낮은 메모리(~20MB)가 Fly.io 최소 인스턴스에서 안정적으로 동작
- Gin: Go 웹 프레임워크 중 생태계 가장 성숙, 미들웨어 풍부

## Consequences
- 장점: 낮은 메모리, 단일 바이너리 배포, 빠른 응답 속도
- 단점: Python 대비 코드량 다소 많음, 라이브러리 선택지 좁음
