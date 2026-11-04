---
type: intake
system: "obsidian-track-changes"
project: ""
event: "finding"
date: 2026-11-04
from: "watchbill, the git-patterns architect-designer claude-plugin-watchbill-78-ho4, session aaf376a6-5ff7-4315-a8a5-1cdeb994e609"
commit: "claude-plugin-watchbill 52d14e26 (the booklet as John saw it)"
processed: null
---

## What this is

John, 2026-11-04 08:1x EST, in the git patterns tab, with a screenshot, verbatim: "there is something wrong with the obsidian whole-doc track changes.... Is it a bug? Kick to that sytem?" The screenshot shows the Track Changes plugin in the watchbill vault (`~/dev/claude-plugin-watchbill`) with the booklet `dev-docs/runs/2026-10-30-git-patterns/08-three-streams-booklet.md` open. The left sidebar, "Pending changes · WHOLE VAULT · 3 files · 255 suggestions · 1 comment · 2 to read whole", lists the booklet under "OPEN MARKS (1)" with 255 suggestions and 0 comments. The right-hand file panel for the same note says "0 comments · 0 suggestions · No comments or suggestions in this file." The note's body in the editor shows only its Properties (type, system, title, status, version, run, proposed_by, proposed_at, design, diagram, contract, and below the fold `diagram_revision`); the marks are in the body below. So the vault-wide index sees the marks and the per-file panel does not, for one and the same file.

What the agent tool says about the file at that moment (0.3.7, run by me at 08:1x): `check` reports "OK: every mark is signed, trackchanges format, not nested", with five notes that a mark "spans lines (written by `revise`, or by the human in Track Changes)" (marks #210 at L643, #409 at L1059, #521 at L1231, #540 at L1296, #544 at L1319); `drift` reports "needs-review (unapproved: no anchor) · 558 open mark(s)"; `is-open` reports "open in Obsidian". The file is 1,400 lines with 544 pending marks by one editor signature, "Claude (editor)", dated 2026-11-03 and 2026-11-04, plus comments. Two things changed in the file in the minutes before the screenshot, both by me: twenty-one `revise` calls at about 07:35 (each replacing one pending suggestion by its id with the same text and the words "proposed on card" changed to "decided on card"), and one plain frontmatter edit at 08:08 adding the line `diagram_revision: r10-20261104-0731` under the `diagram:` property (committed as 52d14e26). The file panel showed 0 after those; I do not know what it showed before them today, and John reviewed the same file's marks in the panel yesterday evening.

## Why it is this system's

A defect in the review panel (the per-file panel disagrees with the vault-wide overview on the same note), which is what this system takes in: "defects and requests about the Track Changes fork (review panel, overview, inline marks …)".

## Facts that make an existing record wrong

None known. The marks themselves are intact by the agent tool's check; nothing in watchbill's records is wrong.

## Proposed text or action (optional)

Two things to try, in the fork, before anything else: (1) whether the per-file panel's parser stops at a mark that spans lines (the five the tool notes), since the whole-vault counter and the file panel evidently parse differently; (2) whether a plain edit to the frontmatter while the note is open (the `diagram_revision` line) leaves the file panel's cache empty until the note is reopened. If (2), the agent tool contract may want a rule that a frontmatter edit on an open note triggers the same refresh as `suggest` does. John's own workaround to test first: close and reopen the note, or switch to another tab and back.

## Out of scope / do not say

Nothing about the booklet's content or the design it carries; the question is only why the panel shows 0 for a file the overview counts at 255.
