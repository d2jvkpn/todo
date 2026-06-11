# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project layout

```
src/                    # Vue 3 app source
public/                 # Static assets served as-is (app.json, icons)
docs/
  Design.md             # Product design spec
  Architecture.md       # Component tree, data flow, build config
  memory/               # Project-specific guidance for Claude
  superpowers/
    plans/              # Implementation plans
    specs/              # Feature design specs
target/dist/            # Production build output
```

All commands are run from the repo root. See `README.md` for the full command reference.

## Docs maintenance

- `docs/Design.md` — full design spec; update when UI behaviour or product decisions change
- `docs/Architecture.md` — architecture reference; update when component structure, data flow, stores, or build config change

**IMPORTANT: Keep docs in sync with every technical change. After completing any feature or architectural change, always sync the docs listed above to reflect the actual code — update immediately and automatically, no need to ask for confirmation.**

## Memory

Project-specific guidance is stored in `docs/memory/`:

- [No auto-commit](docs/memory/feedback_no_auto_commit.md) — Never commit automatically; wait for explicit user request
- [Commits & PRs](docs/memory/feedback_commits.md) — English messages; feat/fix/docs prefixes; `Assisted-by:` trailer on AI commits
