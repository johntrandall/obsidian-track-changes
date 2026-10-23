---
type: intake
system: "obsidian-track-changes"
project: ""
event: "request"
date: 2026-10-23
from: "watchbill (the plugin's architect, watchbill-architect-ho3), session b4d4da71-9b54-4894-a9c7-589e04e99223"
commit: "obsidian-track-changes-agent 0.2.0 (on PATH at /Users/johnrandall/.local/bin); plugin fork 2.3.0-jtr.8"
processed: "2026-10-23 15:02 trackchg-architect: fixed. Agent tool 0.2.1 (private 5e030a5, live on this Mac via ~/.local/bin); plugin landed 30a3974 on feat/bulk-accept, ships in 2.3.0-jtr.9 (release waits on John). Not adopted: acknowledged= closes a thread (an agent flag changes no counts). is-open reports whether the file is open in Obsidian, not marks. Verified: dev-docs/runs/2026-10-23-approve-resolved/verifier-1.md"
---

## What this is

**Start here.** John asked, 2026-10-23 at about 14:47 EDT in the watchbill architect's pane, verbatim: "I'm trying to hit approve this version on 04 decisions and boards and ADRs, but um The plugin won't let me. When I hit approve this version, it says four suggestions or comments are still open beside them before approving this whole. They've already been marked resolved, but those comments should stay there and we should be able to approve the version even with resolved comments. Throw this over the wall to the um the obsidian track changes architect and tell it to ship the fix. Find and ship the fix." This note is that throw: a defect report with a reproduction, and his instruction to ship the fix.

**The defect.** A document whose only remaining marks are **resolved comments** cannot be approved: the plugin's "Approve this version" button refuses with "4 suggestions or comments are still open", and the agent tool's `approve` refuses the same document the same way, while its own `is-open` says the document is not open. John's rule: resolved comments stay in the document (they are the review's record) and must not block approval.

**Reproduction** (Verified, 14:50 EDT, watchbill's vault `/Users/johnrandall/dev/claude-plugin-watchbill`, file `dev-docs/design/04-decisions-board-and-adrs.md`):

```
$ obsidian-track-changes-agent list dev-docs/design/04-decisions-board-and-adrs.md
#1   L51   comment   Claude (editor)  2026-10-23  '…'  [resolved 2026-10-23]
#2   L51   comment   Claude (editor)  2026-10-23  '…'  [resolved 2026-10-23]
#3   L146  comment   Claude (editor)  2026-10-23  '…'  [resolved 2026-10-23]
#4   L162  comment   Claude (editor)  2026-10-23  '…'  [resolved 2026-10-23]
$ obsidian-track-changes-agent is-open dev-docs/design/04-decisions-board-and-adrs.md
not open            (exit 0)
$ grep -cE '\{author="[^"]*" date="[^"]*"(\+\+|~~|--)' dev-docs/design/04-decisions-board-and-adrs.md
0                   (no pending insert, delete or replace)
```

watchbill's approval step (`watchbill decisions watch`, 0.10.57) then ran `obsidian-track-changes-agent approve` on that file for John's recorded yes and got: `refused: 4 mark(s) are open; the human decides them first (or --allow-open approves the base text with every mark rejected)`. The plugin's button, in John's words above, says the same. So `approve` (and the plugin's open-count) count a comment with `resolved="…"` as open, while `is-open` does not: the two disagree, and `approve` is the wrong one.

## Why it is this system's

It is a defect in the approval anchor and the resolved/acknowledged flags of the fork, and in the agent tool's `approve` contract, both of which this system takes in (`watchbill systems`: "approval anchor, resolved/acknowledged flags" and "its agent tool contract").

## Facts that make an existing record wrong

- The agent tool's `approve` help text (and the plugin's refusal message) say "open" where they mean "any comment, resolved or not"; after the fix the message should say what still blocks: pending suggestions, and comments that are neither resolved nor acknowledged.

## Proposed text or action (optional)

Proposals under your rules; John's instruction is to find and ship the fix:

1. **Open means undecided.** A mark is open when it is a pending insert, delete or replace, or a comment with neither `resolved` nor `acknowledged`. A resolved or acknowledged comment is closed and stays in the document through the approval; `approve` writes the approval with those comments in place. Make `approve`, `is-open`, the plugin's "Approve this version" button and the review panel's count share one definition.
2. **Tests:** a document with only resolved comments approves; one with one pending suggestion refuses and names it; one with an unresolved comment refuses and names it; `is-open` and `approve` agree on each.
3. **`--allow-open`** keeps its meaning for pending suggestions (base text, marks rejected) and never strips a resolved comment.
4. Ship as agent tool 0.2.1 and the plugin fork's next build, installed in every vault as before, and tell watchbill's architect (`watchbill-architect-ho3`) the versions: watchbill's approval step retries the waiting approval of D4 on its next pass once the tool approves it.

## Out of scope / do not say

Nothing here asks for a change to the approval record's shape or the keys watchbill reads (`review`, `approved_at`); if the fix needs one, say so in `processed:` before shipping it.

---
Created by Claude Code 2026-10-23
Claude-Session-Id: b4d4da71-9b54-4894-a9c7-589e04e99223
Resume: claude --resume b4d4da71-9b54-4894-a9c7-589e04e99223
