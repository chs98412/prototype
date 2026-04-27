# Task: Create Architecture

## Purpose

Guide the Architect through designing and documenting the web service architecture.

## Instructions for Architect

1. Read `docs/prd.md` fully before starting
2. Ask clarifying questions:
   - Team size and experience level?
   - Preferred cloud provider (AWS / GCP / Azure / self-hosted)?
   - Existing tech stack constraints?
   - Monolith vs. microservices preference?
   - Expected traffic patterns?

3. Propose architecture with these sections (see template):

### Architecture Decisions to Document

**Compute**
- Frontend: SPA (React/Vue/Next.js) or SSR? Or API-only?
- Backend: Language + framework
- Hosting: Containers (Docker/K8s) or serverless or PaaS?

**Data**
- Primary database: PostgreSQL / MySQL / MongoDB / etc.
- Caching layer: Redis / Memcached / CDN?
- File storage: S3-compatible / local?

**API Design**
- REST, GraphQL, or gRPC?
- Authentication: JWT / Session / OAuth 2.0?
- API versioning strategy

**Infrastructure**
- CI/CD pipeline
- Environments: dev / staging / production
- Monitoring & logging
- Secret management

4. For each major decision, document an ADR in `docs/adr/`
5. Draft full architecture doc using `.bmad-core/templates/architecture-template.md`
6. Save as `docs/architecture.md`

## Output

- File: `docs/architecture.md`
- ADR files: `docs/adr/001-*.md`, `docs/adr/002-*.md`, etc.
- Notify Developer and SM that architecture is ready
