---
name: get-jira-issue
description: A skill to get Jira issue details from the CSTY project.
allowed-tools: mcp__jira__jira_get_issue, Bash(acli jira workitem view:*), Read
model: claude-haiku-4-5
---

Get the details of Jira issue `$0` from the CSTY project.

Preferred: use the `mcp__jira__jira_get_issue` MCP tool with issue key `$0`.
Fallback (if MCP is unavailable): run `acli jira workitem view $0`.

Provide a clear summary of what the issue is requesting, including the acceptance criteria if present.
