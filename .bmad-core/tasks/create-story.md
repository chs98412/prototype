# Task: Create Story

## Purpose

Guide the Scrum Master through breaking down an Epic into properly formatted, sized user stories.

## Instructions for Scrum Master

1. Identify the Epic to break down (from `docs/prd.md`)
2. For each story, ask:
   - Who is the user? (persona)
   - What do they need to do?
   - Why? (business value)
   - What does "done" look like? (acceptance criteria)
   - Any dependencies on other stories?

3. Write the story using the template below
4. Size the story with the team:
   - XS (1pt) / S (2pt) / M (3pt) / L (5pt) / XL (8pt — consider splitting)
5. Set initial status to `Draft`
6. PO reviews and changes to `Approved`

## Story Naming Convention

```
Filename: docs/stories/<epic-id>-S<number>.md
Example:  docs/stories/EP01-S01.md
```

## Epic ID Convention

```
EP01 = First epic
EP02 = Second epic
etc.
```

## Story Format

Use `.bmad-core/templates/story-template.md`

## Definition of Ready (before Approved)

- [ ] User story follows "As a / I want / So that" format
- [ ] Acceptance criteria are clear and testable
- [ ] Story is appropriately sized (not an Epic)
- [ ] Dependencies identified
- [ ] No open questions / ambiguities

## Output

- Story file: `docs/stories/<epic-id>-S<number>.md`
- Update sprint plan: `docs/stories/sprint-N-plan.md`
