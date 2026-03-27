---
name: Coding style preferences
description: Byron's coding rules and style preferences for this project and in general
type: feedback
---

- Descriptive names
- Comments only where they add value (explain decisions or non-obvious code)
- Parse don't validate
- Reusability (no duplication)
- Performance optimisation, scalability, code splitting
- Fail fast
- Tailwind for styling, config files, no magic numbers, cn() for class composition (always when >1 class)
- Watch for global side effects when editing shared UI components
- Tests for everything but don't overtest - each test must add value, don't test 3rd party libs
- Never use em dashes in text output - use regular dashes, commas, or restructure
- Branch naming: sc-{ticket}/feature/{description}
- Conventional Commits enforced by commitlint + Husky
- Annotated tags only (pre-push hook rejects lightweight)
- PRs target main
- Always ask before committing
