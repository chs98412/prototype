# Workflow: Web Service Development

## Overview

This workflow guides the development of a web service from idea to production using BMad agents. It follows an agile approach with clear phase gates.

---

## Phase 1: Discovery & Requirements

**Lead Agent**: Analyst
**Output**: `docs/prd.md`

### Steps
1. Activate **Analyst**: "Act as the Analyst"
2. Describe the web service idea, business goals, and target users
3. Analyst asks clarifying questions (personas, core features, constraints)
4. Analyst drafts PRD using `.bmad-core/templates/prd-template.md`
5. Review PRD → iterate until approved

### Gate
- [ ] PRD is complete and covers all core epics
- [ ] Non-functional requirements defined (performance, security, availability)
- [ ] PO has reviewed and approved

---

## Phase 2: Architecture

**Lead Agent**: Architect
**Output**: `docs/architecture.md`

### Steps
1. Activate **Architect**: "Act as the Architect"
2. Architect reviews PRD
3. Architect proposes tech stack + system design with trade-offs
4. Agree on: language, framework, database, hosting, CI/CD
5. Architect documents decisions using `.bmad-core/templates/architecture-template.md`
6. Major decisions logged as ADRs in `docs/adr/`

### Gate
- [ ] Architecture document complete
- [ ] Tech stack agreed
- [ ] API contract defined (at least high-level)
- [ ] Dev environment setup documented

---

## Phase 3: Epic & Story Breakdown

**Lead Agents**: Scrum Master + Product Owner
**Output**: Story files in `docs/stories/`

### Steps
1. Activate **Scrum Master**: "Act as the Scrum Master"
2. Break PRD Epics into Stories using `.bmad-core/tasks/create-story.md`
3. Each story must have clear acceptance criteria
4. PO reviews and approves stories before they enter sprint backlog
5. Stories sized and prioritized (MoSCoW)

### Story File Convention
```
docs/stories/<epic-id>-<story-number>.md
Example: docs/stories/EP01-S01.md
```

### Gate
- [ ] At least one sprint's worth of Approved stories
- [ ] Stories are sized and prioritized
- [ ] Sprint goal defined in `docs/stories/sprint-1-plan.md`

---

## Phase 4: Sprint Development Loop

Repeat for each story in the sprint:

### 4a. Implement (Developer)
1. Activate **Developer**: "Act as the Developer"
2. Developer picks next `Approved` story
3. Implements and sets status → `In Progress`
4. Writes tests alongside code
5. Sets status → `Review` when done

### 4b. Test (QA Engineer)
1. Activate **QA Engineer**: "Act as the QA Engineer"
2. QA reviews implementation against acceptance criteria
3. Runs/writes automated tests
4. Reports defects → Developer fixes
5. Approves story for PO review

### 4c. Accept (Product Owner)
1. Activate **Product Owner**: "Act as the Product Owner"
2. PO verifies story meets acceptance criteria
3. Accepts → status `Done` (move to `docs/stories/done/`)
4. Or rejects → with clear feedback, story goes back to `In Progress`

---

## Phase 5: Sprint Review & Retrospective

**Lead Agent**: Scrum Master

1. Summarize completed stories and demo if applicable
2. Update velocity / capacity notes
3. Retrospective: what worked, what to change
4. Plan next sprint (back to Phase 3/4)

---

## Definition of Done (DoD)

A story is `Done` when:
- [ ] All acceptance criteria met
- [ ] Automated tests written and passing
- [ ] No open Critical/High defects
- [ ] Code committed to the repository
- [ ] Documentation updated (if applicable)
- [ ] PO has accepted the story

---

## Escalation Paths

| Blocker Type | Escalate To |
|---|---|
| Technical uncertainty | Architect |
| Scope question | Product Owner |
| Process / priority | Scrum Master |
| Requirements unclear | Analyst |
