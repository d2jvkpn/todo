# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project layout

```
src/                    # Vue 3 app source
public/                 # Static assets served as-is (app.json, icons)
docs/
  Design.md             # Product design spec
  Architecture.md       # Component tree, data flow, build config
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

## Commits

- **Never commit automatically.** Always wait for an explicit request ("帮我提交", "commit this", etc.) before running `git commit`.
- Write commit messages in **English**.
- Use standard prefixes: `feat:`, `fix:`, `docs:`, etc.
- Every AI-assisted commit must include: `Assisted-by: <agent_name>:<model_version>`
- Do **not** add `Signed-off-by` or `Co-Authored-By` on behalf of the author.
