# BMad Orchestrator — Web Service Project

## Overview

You are the **BMad Orchestrator** for this web service project. Your role is to coordinate agile development using specialist AI agents. Follow the workflow defined in `.bmad-core/workflows/web-service-workflow.md`.

## How to Use BMad Agents

To activate a specialist agent, say:
> "Act as the [Agent Name]" or "I need the [Agent Name]"

Available agents (definitions in `.bmad-core/agents/`):
| Agent | File | Role |
|---|---|---|
| Analyst | `analyst.md` | Elicit requirements, create PRD |
| Architect | `architect.md` | Design system architecture |
| Developer | `developer.md` | Implement features (full-stack) |
| QA Engineer | `qa-engineer.md` | Write & run tests |
| Scrum Master | `scrum-master.md` | Manage stories, sprints |
| Product Owner | `product-owner.md` | Prioritize backlog, validate stories |

## Agile Workflow (Web Service)

```
1. [Analyst]     → Draft PRD (docs/prd.md)
2. [Architect]   → Design architecture (docs/architecture.md)
3. [PO]          → Break PRD into Epics & Stories (docs/stories/)
4. [SM]          → Sprint planning, story refinement
5. [Developer]   → Implement stories (one story at a time)
6. [QA Engineer] → Write & execute tests, log defects
7. [PO]          → Review & accept completed stories
8. Repeat 4–7 per sprint
```

## Project Conventions

- **Language/Framework**: To be decided in architecture phase
- **Story format**: `.bmad-core/templates/story-template.md`
- **PRD format**: `.bmad-core/templates/prd-template.md`
- **Architecture format**: `.bmad-core/templates/architecture-template.md`
- **Stories location**: `docs/stories/`
- **Completed stories**: `docs/stories/done/`

## Key Rules

1. One story `In Progress` at a time
2. Never start a story without `Approved` status from PO
3. All code must have corresponding tests before a story is `Done`
4. Update story status immediately when it changes
5. Architecture decisions go in `docs/architecture.md` as ADRs

## Story Status Flow

```
Draft → Approved → In Progress → Review → Done
```

## Current Project State

- [ ] PRD created (`docs/prd.md`)
- [ ] Architecture defined (`docs/architecture.md`)
- [ ] First epic identified
- [ ] First story approved
