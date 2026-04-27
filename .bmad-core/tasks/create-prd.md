# Task: Create PRD

## Purpose

Guide the Analyst through creating a complete Product Requirements Document.

## Instructions for Analyst

1. Greet the user and explain you'll be creating the PRD together
2. Ask the following questions (one at a time, adapt based on answers):

### Discovery Questions

**Business & Goals**
- What problem does this web service solve?
- Who are the primary users? (personas)
- What does success look like? (KPIs, metrics)
- What is the MVP vs. future scope?

**Features**
- What are the core features a user must have on day 1?
- What features are important but not critical for launch?
- Are there any features explicitly out of scope?

**Constraints**
- Any technology preferences or constraints?
- Expected user scale? (100 users, 10K, 1M?)
- Any compliance requirements? (GDPR, HIPAA, SOC2, etc.)
- Budget or timeline constraints?
- Integration with existing systems?

**Non-Functional Requirements**
- Performance expectations? (response time, throughput)
- Availability requirements? (uptime SLA)
- Security requirements beyond standard best practices?

3. Summarize what you've heard before writing
4. Draft the PRD using the template at `.bmad-core/templates/prd-template.md`
5. Save as `docs/prd.md`
6. Ask for review and iterate

## Output

- File: `docs/prd.md`
- Notify PO that PRD is ready for review
