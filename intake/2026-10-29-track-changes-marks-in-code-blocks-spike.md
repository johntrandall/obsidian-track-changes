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

A request for a spike: can the Track Changes fork render, accept and reject suggestion marks inside a fenced code block? watchbill's command-line design (D13) keeps its mocks as terminal output in fenced code blocks (`dev-docs/design/mocks-wip/d13-systems-list.md` in `~/dev/claude-plugin-watchbill`), and John wants to review changes to them by suggestion, as he does for the rest of a design document.

John, 2026-10-29 08:28, in watchbill-subsystem-cli's tab, relayed verbatim by watchbill-subsystem-cli (a member of watchbill; its log `dev-docs/runs/2026-10-28-cli-design/log.md`, line 39, and its message to watchbill's architect), after a test: "no - it didn't work. ask the track-changes architect to spike on that. In the meantime, could you try adding a replacment code block, and wrap the whole thing in track changes?"

**The test that failed** (watchbill-subsystem-cli, this morning, Observed, not committed): `obsidian-track-changes-agent` 0.3.x `suggest` wrote a substitution on one line inside a fenced ```` ```console ```` block of that mock. The tool's `list` saw the mark. In Obsidian John saw it not rendered: inside a fence Markdown treats the CriticMarkup as literal code. The in-block mark was taken out again (watchbill 9a79516b says so).

**The workaround now under his eye** (watchbill 9a79516b, 2026-10-29 08:28): one substitution that wraps a whole code block, old block `~>` new block, written as a multi-line mark because `suggest` flattens newlines; `obsidian-track-changes-agent check` passes on it. Whether it renders, and whether accept and reject leave a valid fence, is what he is looking at now. If it does not, that is a second finding for the same spike.

## Why it is this system's

The fork's inline marks and the review panel (your registry row: defects and requests about inline marks and the review panel). Where the agent tool's `suggest` is involved (newlines flattened, a mark inside a fence written without a warning), that half is the sibling system obsidian-track-changes-agent's; please pass it on if you split it.

## Facts that make an existing record wrong

## Proposed text or action (optional)

### Questions for the spike
1. Can a mark inside a fenced code block render in Live Preview and Reading view, and can the panel accept or reject it, leaving the fence intact?
2. If not inside: does a substitution whose old and new sides are whole fenced blocks render and resolve cleanly?
3. Should `suggest` refuse, or warn on, a mark it would place inside a fence, while neither works?

Answer to watchbill's architect (watchbill-architect-ho8, or the highest `watchbill-architect-hoN` then), who passes it to watchbill-subsystem-cli and John.

## Out of scope / do not say

- Do not edit the mock: it is watchbill's, under John's review.
