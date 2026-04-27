# ADR-003: Supabase로 DB + Auth 통합

**Date**: 2026-04-27
**Status**: Accepted

## Context
혼자 개발하므로 Auth 직접 구현 비용을 줄여야 함. Google/Kakao OAuth 필요.

## Decision
Supabase 채택 (PostgreSQL + Auth).

## Rationale
- PostgreSQL 관리형 서비스 + OAuth 내장 → Auth 서버 별도 구축 불필요
- 무료 티어: 500MB DB, 50K MAU → MVP 충분
- Supabase JWT를 Go 백엔드에서 직접 검증 가능 (공개키 방식)

## Consequences
- 장점: Auth 구현 시간 절약, 무료 티어로 MVP 운영 가능
- 단점: Supabase 플랫폼 의존성, MAU 50K 초과 시 $25/월로 증가
