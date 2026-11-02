---
type: intake
system: "obsidian-track-changes"
project: ""
event: "request"
date: 2026-11-02
from: "watchbill (lead designer watchbill-architect-ho13, session dad93586-9518-43b1-bb2a-c0eae5129191)"
commit: "~/dev/claude-plugin-watchbill e0c99b52 (the hand restoration this request comes from)"
processed: "2026-11-02: already built as the withdraw verb (agent tool branch build/withdraw, verified 2026-10-26); waits on John's card dev-docs/substantive/2026-10-26-let-a-seat-withdraw-its-own-suggestion.md, to which this case was added as a reply"
---

## What this is

A request for the agent tool (`obsidian-track-changes-agent`): a verb that withdraws an agent's own pending suggestion, leaving the text as it was before the suggestion and touching no other mark. Today (2026-11-02, about 09:3x EST) watchbill's design seat had to take back a pending suggestion of its own on `dev-docs/design/06-….md` §5 after John moved the matter to a later card. It found no withdraw verb; `block` would have deleted and re-added the whole line the suggestion sat in, so it restored the line by hand, byte for byte, and committed e0c99b52 in watchbill's repository. A hand edit of a document under review is what the agent tool exists to avoid.

## Why it is this system's

A request about the agent tool's contract (its verbs over marks) is this system's; the agent tool is this system's sibling and has no registry row of its own.

## Facts that make an existing record wrong

(none: the tool has no withdraw verb rather than a wrong one)

## Proposed text or action (optional)

### For the agent tool

- `obsidian-track-changes-agent withdraw <file> --marks <id>`: removes a pending suggestion the calling role made (an addition, a deletion, or a substitution), restoring the original text exactly, and the comments attached to that suggestion with it; refuses a mark of another role, an accepted or rejected mark, and a mark with a comment of the human's on it (that one is his to resolve). A `--why` is recorded in the tool's log line, as `revise` records its reason.
- The verb is distinct from `block`, which replaces a span; withdrawing is undoing one's own proposal, not proposing a new text.

## Out of scope / do not say

Nothing about the plugin's review panel; this is the agent tool alone. No change to how `revise` folds suggestions.
