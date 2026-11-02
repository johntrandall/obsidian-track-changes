---
type: intake
system: "obsidian-track-changes"
project: ""
event: "finding"
date: 2026-11-02
from: "watchbill (lead designer watchbill-architect-ho13, session dad93586-9518-43b1-bb2a-c0eae5129191; observed by the design seat watchbill-subsystem-design-ho27)"
commit: "~/dev/claude-plugin-watchbill c254ed51 (the accept this was seen on)"
processed: null
---

## What this is

A defect in the agent tool (`obsidian-track-changes-agent`), seen at about 09:5x EST on 2026-11-02 on watchbill's `dev-docs/design/07-….md` and `06-….md`: after `accept --licence <card>` of the agent's own suggestion (root comment 0eae243), the reply comment 7ab0e14 under it still lists as open, while `resolve` on that reply refuses and says the thread was "resolved by the human". It was the `accept` that resolved the root, by the agent under a card's licence, not the human; so the attribution is wrong, and the reply is left neither open nor resolvable by the agent.

## Why it is this system's

A defect in the agent tool's contract (how `accept` resolves a thread and how `resolve` reads it) is this system's.

## Facts that make an existing record wrong

- The tool's listing: 7ab0e14 shown open after its root was resolved by `accept`.
- `resolve`'s refusal text: "resolved by the human" for a root the agent resolved under a licence.

## Proposed text or action (optional)

- `accept` of a suggestion resolves its root and every reply under it in one act, attributed to the accepting role and the licence (the card) it cited; the listing shows none of them open.
- `resolve`'s refusal names who resolved the root and how (the role, `accept --licence <card>`), so a reader does not look for a human act that never happened.

## Out of scope / do not say

Nothing about the review panel or about `revise`.
