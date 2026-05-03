---
name: Stop hook — /memory-update reminder
description: A Stop hook in settings.local.json echoes a /memory-update reminder after every Claude response
type: project
originSessionId: c61a0c6e-91e6-4d70-af99-5178536e179f
---
A `Stop` hook is configured in `.claude/settings.local.json` (globally gitignored — not in git history):

```json
"hooks": {
  "Stop": [
    {
      "matcher": "",
      "hooks": [{ "type": "command", "command": "echo '\\n[MEMORY REMINDER] Run /memory-update to save session state to memory before ending.'" }]
    }
  ]
}
```

**Why:** Reminder fires automatically so sessions don't end without saving memory. Added in T3 session (2026-05-02).

**How to apply:** If the reminder isn't appearing after responses, check `.claude/settings.local.json` — the hook is local-only and won't be visible in git. The file is globally gitignored via `~/.config/git/ignore`.
