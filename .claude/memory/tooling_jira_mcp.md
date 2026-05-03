---
name: Jira MCP server — sooperset/mcp-atlassian
description: mcp-atlassian is configured via .mcp.json at project root; mcpServers in settings.local.json is invalid in Claude Code v2.x
type: project
originSessionId: e6132c32-3696-49dc-8b20-c17a8a629357
---
`sooperset/mcp-atlassian` is the Jira MCP server, named `jira`.

**Config location (v2.x):** `.mcp.json` at project root (gitignored — contains API token). `mcpServers` in `settings.local.json` is NOT valid in Claude Code v2.x and is silently ignored, which is why tools were unavailable.

```json
// .mcp.json (gitignored)
{
  "mcpServers": {
    "jira": {
      "command": "uvx",
      "args": ["mcp-atlassian"],
      "env": {
        "JIRA_URL": "https://curiosity-platform.atlassian.net",
        "JIRA_USERNAME": "leandro.curiosityteam@gmail.com",
        "JIRA_API_TOKEN": "<token>"
      }
    }
  }
}
```

`settings.local.json` has `"enableAllProjectMcpServers": true` to auto-approve without a prompt.

**Status:** Active — `.mcp.json` in place as of 2026-05-03.

**Tools available:** `mcp__jira__jira_get_issue`, `mcp__jira__jira_search_issues`, `mcp__jira__jira_create_issue`, `mcp__jira__jira_transition_issue`, `mcp__jira__jira_update_issue`, `mcp__jira__jira_add_comment`.

**Why:** Fully bidirectional Jira operations directly in Claude Code. `get-jira-issue` skill prefers MCP with `acli` fallback. ADR-010 in `.claude/DECISIONS.md`.

**How to apply:** Use `mcp__jira__jira_get_issue` for issue fetches. Fall back to `acli` if tools are unavailable. If tools are missing in a new session, check that `.mcp.json` exists at project root (it's gitignored and may need to be recreated).
