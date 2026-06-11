# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project layout

```
src/                    # Vue 3 app source
public/                 # Static assets served as-is (app.json, icons)
docs/
  Design.md             # Product design spec
  Architecture.md       # Component tree, data flow, build config
  plans/                # Implementation plans
  memory/               # Project-specific guidance for Claude
target/dist/            # Production build output
```

All commands are run from the repo root. See `README.md` for the full command reference.

## Docs

- `docs/Design.md` — full design spec; update when UI behaviour or product decisions change
- `docs/Architecture.md` — architecture reference; update when component structure, data flow, stores, or build config change
- `docs/plans/` — implementation plans

After completing any feature or architectural change, prompt the user to update the relevant docs above. Do not update docs silently — present a summary of what changed and ask the user to confirm before editing.

## Memory

Project-specific guidance is stored in `docs/memory/`:

- [No auto-commit](docs/memory/feedback_no_auto_commit.md) — Never commit automatically; wait for explicit user request
- [Commits & PRs](docs/memory/feedback_commits.md) — English messages; feat/fix/docs prefixes; `Assisted-by:` trailer on AI commits
