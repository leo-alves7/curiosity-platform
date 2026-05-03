---
name: Subagent permission requests require user approval, not team-lead SendMessage
description: When a coder subagent sends a permission_request message, the correct unblocking path is the user's tool-approval UI — not a SendMessage from the team lead
type: feedback
originSessionId: 53ab247f-9470-42ac-85e3-ae00e2594450
---
When a teammate agent sends a `permission_request` message (e.g. asking to edit a rules file), **do not attempt to approve it via SendMessage**. That message goes to the agent's inbox but does NOT unblock the permission gate — the agent remains stalled waiting for the SDK-level approval that only the user can grant through the normal tool-permission UI.

**Why:** `permission_request` is an SDK-level event, not a protocol message. SendMessage responses only handle `shutdown_request` and `plan_approval_request`. Sending an approval message has no effect and leaves the agent stuck.

**How to apply:**
- When you see a `permission_request` from a subagent, just watch for the user's approval UI to appear (the agent is paused, not dead)
- If the agent appears stuck for more than a minute after the request, take over: do the remaining work directly in the main session and send the agent a shutdown request
- After a subagent completes work, always verify its changes with `git diff` before proceeding — subagents can silently introduce bugs (e.g. changing `useEffect(() => {}, [])` to `useEffect(() => {}, [center, dispatch, zoom])` which would recreate the map on every pan)
