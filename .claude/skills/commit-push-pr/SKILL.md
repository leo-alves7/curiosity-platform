---
name: commit-push-pr
description: A skill to commit changes, push to a branch, and create a pull request on GitHub.
allowed-tools: Bash(git checkout -b:*), Bash(git branch:*), Bash(git add:*), Bash(git status:*), Bash(git diff:*), Bash(git push:*), Bash(git commit:*), Bash(gh pr create:*)
model: claude-haiku-4-5
---

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`

Based on the above changes:

1. Determine the Jira issue key (e.g. CSTY-123):
   - Try to extract it from the current branch name (look for a pattern like `CSTY-123` at the start or anywhere in the branch name)
   - If not found, ask the user: "What is the Jira issue key for this work? (e.g. CSTY-123)"
2. Create a new branch if on main, using the format: `CSTY-123-short-description` (kebab-case)
3. Create a single commit with the message format: `CSTY-123 - Short description`. Do not format the code unless the user asks for it, and you should use the /format-code skill for that.
4. Push the branch to origin
5. Create a pull request using `gh pr create` with the title format: `CSTY-123 - Short description`
6. You have the capability to call multiple tools in a single response. You MUST do all of the above in a single message. Do not send any other text or messages besides these tool calls.
