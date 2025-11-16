# Copilot Instructions for This Repo

## My general preferences

- I am a solo developer. I want **minimal code** and **minimal moving parts**.
- Prefer **simple, boring tech** over fancy stacks.
- Default to:
  - Backend: small Python scripts / FastAPI or simple Node/Express if already used.
  - Frontend: static HTML + minimal JS, or a single-page React component only if the repo is clearly React-based.
  - Storage: simple JSON/CSV/local file or a single Postgres table if already configured.
- Only introduce new tools when **strictly necessary** and **when they are clearly simpler** than alternatives.

## Coding style

- Favor **clarity over cleverness**.
- Keep functions short and focused.
- Avoid deep abstraction layers “just in case”. No premature architecture.
- Use descriptive names, but not overly verbose.
- Add **short, practical comments** only where logic is non-obvious.

## Dependencies and libraries

- Default rule: **Standard library first**.
- Before adding a dependency, ask:
  - “Can we do this with stdlib or a tiny helper function instead?”
- Do **not** suggest:
  - Heavy ORMs or frameworks unless the repo is already using them.
  - Complex CI/CD setups.
  - Kubernetes, Docker, microservices, or infra unless explicitly requested.

## Stack choices

When in doubt, Copilot should choose:

- **API / backend**
  - Use a single file (or very small set of files) with:
    - Python + FastAPI **or**
    - Node + Express
  - Basic routing only. Avoid over-structuring.
  - If the project already uses a framework, follow that instead of introducing new ones.

- **Database & persistence**
  - If Postgres is already configured, add **one simple table** and a few straightforward queries.
  - If no DB is set:
    - Start with a simple file-based approach (JSON/CSV) unless persistence requirements are clearly complex.

- **Frontend / UI**
  - Prefer simple HTML + vanilla JS for basic forms and pages.
  - Use React/Next only if the existing repo is already using them.
  - No CSS frameworks unless they’re already present (Tailwind, Bootstrap, etc.).

## Project structure

- Keep the structure flat and simple.
- Only create new folders when there is **an obvious, concrete need** (e.g., `api/`, `scripts/`, `ui/`).
- Don’t split files just for the sake of “clean architecture”.

## Behavior when generating code

When suggesting changes or new files, Copilot should:

1. **Explain the minimal design** in 3–5 bullet points before dumping big chunks of code.
2. Prefer **small, incremental changes** over huge refactors.
3. Reuse existing patterns, files, and utilities from this repo whenever possible.
4. Avoid speculative features or overengineering.

## Error handling and logging

- Use **simple, pragmatic error handling**.
- Log enough to debug issues, but don’t build complex logging frameworks.
- For scripts and small APIs, `print`/basic logging is fine.

## Tests

- Prefer a few **high-value tests** over complex test setups.
- If adding tests:
  - Use the simplest built-in framework (e.g., `pytest` for Python).
  - Focus on critical logic, not 100% coverage.

---

**Summary for Copilot**

- Think like a pragmatic solo dev.
- Prefer **simple, boring, minimal solutions**.
- Avoid new frameworks/tools unless explicitly requested.
- Smaller, clearer code > clever abstractions.