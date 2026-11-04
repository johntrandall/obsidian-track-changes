---
type: intake
system: "obsidian-track-changes"
project: ""
event: "request"
date: 2026-11-04
from: "watchbill (lead designer watchbill-architect-ho13, session dad93586-9518-43b1-bb2a-c0eae5129191; found by the build lead watchbill-build-091)"
commit: "~/dev/claude-plugin-watchbill a8910a3f (the review step's fix that works around it)"
processed: null
---

## What this is

A request for the agent tool (`obsidian-track-changes-agent`, 0.3.5): when `revise` replaces a pending suggestion with a new one, `list --json` names no link from the old mark id to its successor. watchbill's board daemon records a review card's awaited marks by id and judges the card from `list`; after a `revise` it cannot tell a revised mark from a rejected one, and on 2026-11-03 at 11:19 it wrote "0 of 0 suggestions were not accepted" onto John's card and cleared its marks (watchbill's record: its 0.10.91 brief item A3 and the card 2026-11-03-confirm-release-notices-without-a-restart-storm). The 0.10.91 build works around it by matching the revised text, which is fragile.

## Why it is this system's

A field of the agent tool's `list --json` contract is this system's.

## Facts that make an existing record wrong

(none; the field is absent rather than wrong)

## Proposed text or action (optional)

### For the agent tool

- `revise` records, on the new mark, `revised_from: <old id>` (and on the tool's agent-removed record of the old mark, `revised_to: <new id>`); `list --json` prints both fields, and `list` prints "(revised from <old id>)" on the new mark's line.
- `accept`, `reject` and `resolve` given an old id say "revised to <new id>" and act on nothing.

## Out of scope / do not say

Nothing about the review panel; the agent tool alone.
