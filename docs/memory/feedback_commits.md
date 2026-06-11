---
name: feedback-commits
description: Commit message language, preferred prefixes, and AI attribution format
metadata:
  type: feedback
---

Never create a commit unless the user explicitly asks for one. See also [[feedback-no-auto-commit]].

**Why:** User wants full control over when commits happen.

**How to apply:** Wait for an explicit instruction before running any `git commit`.

---

## Message language

Always write commit messages in **English**.

## Preferred prefixes

- `feat: add proxy handler`
- `fix: handle upstream timeout response`
- `docs: update backend decisions`

## AI attribution

Every AI-assisted commit must include a trailer:

```
Assisted-by: <agent_name>:<model_version>
```

- Do **not** add `Signed-off-by` or `Co-Authored-By` on behalf of the author.
- List only specialized analysis tools; omit `git` or editors.
