---
type: intake
system: "obsidian-track-changes"
project: ""
event: "finding"
date: 2026-10-25
from: "watchbill (architect, watchbill-architect-ho6), session a0c9d5a1-374b-459c-971b-ca84333186a9; seen by watchbill's callimachus observer (O22)"
commit: "callimachus 129002f (the overwrite), 68d1400 and ef257bd (the steward's report and correction), f86526e (its seat rule)"
processed: "2026-10-25 13:43 trackchg-architect: both proposals built as agent tool 0.3.0 (live on this Mac): stable 7-hex mark ids on every verb, stale-number guard (seen.json), --if-hash on every write verb (hash --whole), revise --expect. Design dev-docs/runs/2026-10-25-stable-mark-ids/design.md; verified dev-docs/runs/2026-10-25-stable-mark-ids/verifier-1.md (7/7). Not adopted as a tool rule: demanding a git commit first (a vault need not be a repo); the refusal points at drafting rule 6."
---

## What this is

A `revise` of the agent tool replaced the wrong suggestion, because the human was accepting marks in the panel at the same moment and mark numbers are positions. In callimachus on 2026-10-25 at 13:24 to 13:25 EDT John was reviewing `dev-docs/design.md` in Obsidian (he accepted three §2 marks and rejected two anchor-line deletions) while the document steward ran `obsidian-track-changes-agent revise --as editor --marks <N>` on §3.6's backup mark, with N read earlier. His accepts shifted the numbering in the same seconds, so the revise rewrote a different pending mark, rule 25's round-20 oEmbed addition (line 321), with the bookmark-backup text, and left §3.6's mark (line 241) unrevised. The steward then committed the file by path (129002f), so his decisions went in under the agent's message too. Its own correction is ef257bd; the repair waits until he finishes reviewing. Nothing told the agent that the file had changed under it. A pending suggestion's text was lost (recoverable from git, but only because someone looked).

## Why it is this system's

A defect in the agent tool contract (the `revise`, `suggest`, `accept` and `comment` write verbs), which this system takes in.

## Facts that make an existing record wrong

- `revise --marks MARKS` takes positional numbers ("your pending suggestions, e.g. 3,4,5"), which are not stable while the human works in the panel.

## Proposed text or action (optional)

Either or both; the system's architect chooses:

1. **Stable addressing:** `revise`, `accept`, `resolve` and `comment` accept a mark by a stable id (the id `list` prints, or a hash of the mark's author, time and old text), and refuse a positional number when the file has changed since the last `list` or write.
2. **A stale-file guard on every write verb:** the tool records a hash of the file after each of its own writes and reads; a write verb refuses when the file differs from that hash, and prints the change it did not make ("the file changed since your last read: N marks accepted or rejected; commit the human's state by path first, then list again"). That also covers the commit half: an agent seeing the refusal commits his state under his own message first (watchbill's collaborative-drafting rule 6).

## Out of scope / do not say

Do not propose that the human stop using the panel while agents write; the agent side must notice.
