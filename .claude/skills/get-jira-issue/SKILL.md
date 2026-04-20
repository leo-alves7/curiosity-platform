---
name: get-jira-issue
description: A skill to get Jira issue details from the CSTY project.
allowed-tools: Bash(acli jira workitem view:*), Read
model: claude-haiku-4-5
---

Get the details of a Jira issue using the following command: `acli jira workitem view $0` command.
You should try to understand what the Jira issue is requesting and provide a good summary.
