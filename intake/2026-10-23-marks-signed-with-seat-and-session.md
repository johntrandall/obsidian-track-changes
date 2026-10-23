---
type: intake
system: "obsidian-track-changes"
project: ""
event: "request"
date: 2026-10-23
from: "watchbill (the plugin's architect, watchbill-architect-ho3), session b4d4da71-9b54-4894-a9c7-589e04e99223"
commit: "obsidian-track-changes-agent 0.2.1; plugin fork 2.3.0-jtr.8 installed, jtr.9 pending John's word"
processed: null
---

## What this is

**Start here.** John asked, 2026-10-23 at 15:1x EDT in the watchbill architect's pane, verbatim: "In changes, I need to see what seat and session are actually making the change. Right now it just says Claude Editor. It needs to be clear to me if it's you, one of your helpers, or the document steward. I believe this is accounted for in our Obsidian Track Changes plugin. So coordinate with the architect of that system to make it happen." Today every agent mark is signed `author="Claude (editor)"` (or `Claude (checker)`): the role, never which agent. In watchbill several agents mark the same document in one afternoon (the design seat `watchbill-subsystem-design-ho6`, the document steward `watchbill-copy-editor`, the C4 helper `watchbill-design-c4`, the architect), and John cannot tell them apart in the review panel or in the text.

**What the tool does today** (Verified 15:1x): `suggest --as ROLE` writes `author="Claude (ROLE)"` and refuses any ROLE but `editor` for text changes ("only the editor may suggest text changes (you are '…')"), so the role slot cannot carry an identity.

## Why it is this system's

The mark's author string, what the review panel shows per mark, and the agent tool's `--as` contract are this system's (the fork and its agent tool).

## Facts that make an existing record wrong

- None. The tool's own header says "A mark signed 'Claude (…)' is an agent's; any other author is the human's", which stays true under the proposal below.

## Proposed text or action (optional)

1. **Author = role plus identity.** `author="Claude (editor · watchbill-subsystem-design-ho6 · a9965d0d)"`: the role first (so the role rules keep working on the first word), then the agent's name and the first eight characters of its session id, separated by ` · `. The tool keeps treating any author starting `Claude (` as an agent's.
2. **Taken from the environment by default, no new flag needed by callers:** the name from the herdr session name (`herdr-lifecycle` writes it; `$HERDR_AGENT_NAME` or the ledger at `~/.local/state/herdr-lifecycle/`), the session id from `$CLAUDE_SESSION_ID`; a `--who "<name> · <sid8>"` override for callers outside herdr; when neither is available, today's `Claude (editor)` so nothing breaks.
3. **The review panel** shows the identity part per mark (and groups or filters by it if that is cheap), and the overview counts marks per author.
4. `approve`, `drift`, `tidy`, `revise --marks`, `accept`/`reject` and `is-open` are unchanged by the longer author string (a test that a mark signed the new way round-trips through each).
5. Ship with the pending fork build (jtr.9 or the next) and the agent tool's next version; tell `watchbill-architect-ho3` the versions. On the watchbill side the rule "every seat's marks name the seat and session" then needs no caller change; I record it in the plugin's document-review skill as a statement of what the marks carry.

## Out of scope / do not say

Nothing here changes the human's author (`John Randall`), the resolved/acknowledged flags or the approval record.

---
Created by Claude Code 2026-10-23
Claude-Session-Id: b4d4da71-9b54-4894-a9c7-589e04e99223
Resume: claude --resume b4d4da71-9b54-4894-a9c7-589e04e99223
