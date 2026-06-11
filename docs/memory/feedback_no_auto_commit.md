---
name: feedback-no-auto-commit
description: User does not want Claude to auto-commit after writing files
metadata:
  type: feedback
---

Don't commit changes automatically after writing or editing files.

**Why:** User prefers to control when commits happen — auto-commits are unexpected and need to be undone.

**How to apply:** Always wait for an explicit commit request ("帮我提交", "commit this", etc.) before running `git commit`. Writing files, creating docs, or completing tasks does not imply permission to commit.
