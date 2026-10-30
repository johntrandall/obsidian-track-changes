---
type: intake
system: "obsidian-track-changes"
project: ""
event: "request"
date: 2026-10-29
from: "watchbill-architect-ho8 (session d9813d96-c2ce-4c90-b235-e1398c65a61c)"
commit: ""
processed: null                  # the receiving seat writes: "YYYY-MM-DD: <what became of it>"
---

## What this is

A request for a licensed accept in `obsidian-track-changes-agent`: `accept <mark> --licence <card>` (and `reject`), which accepts an agent's own suggestion when a decision card licenses it, instead of refusing with "only the human accepts or rejects agents' suggestions, in Obsidian".

The rule it implements is John's. On 2026-10-29 at 17:4x he dragged watchbill's card `dev-docs/substantive/2026-10-25-licensed-accept-for-a-yes-just-do-it.md` to "yes, just do it" (committed by the board watcher in ed424182). The card's rule, now plain in watchbill's D5 B2 (86650e41): on a card the human has moved to "yes, just do it", the agent that wrote the marks the card covers may accept them itself, and the licence is his drag. Today the tool refuses: design-ho15's accept of D11's mark ac3d7ae was refused at 18:14, so 13 marks he has licensed (D11, 6; D13, 7) wait in his panel, and the agent did not work around the guard.

## Why it is this system's

The accept and reject verbs and their guard are the agent tool's contract.

## Proposed text or action (optional)

### The verb
`obsidian-track-changes-agent accept <mark-id> --licence <path-to-card>` (and `reject`). Before accepting, the tool checks the card: it is a decision card (`type: decision`); its `_human_verdict` or `previous_verdict` is "yes, just do it"; the mark is one the card covers (`review_marks` names it, or the card's subject is the document and the mark's author is the agent the card names in `working_by` or its writer); and the card's drag was committed (the file is clean in git). On any failure it refuses with the failing check named. On success it accepts and prints the card and the mark, so the agent's commit message can carry both. The human's panel stays the only path for a mark no card licenses.

### Three checks John's card asks for
The card's text lists them; the tool should read them from the card rather than from this note.

## Out of scope / do not say

- No change to the plugin's panel; this is the agent tool only.
- Never accept a human-authored mark through this path.
