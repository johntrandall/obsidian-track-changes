---
type: intake
system: "obsidian-track-changes"
project: ""
event: "request"
date: 2026-10-30
from: "watchbill, architect ho10, session 00854bf6-3b1f-4ecc-89bf-e80d48ea7f3a (session 00854bf6-3b1f-4ecc-89bf-e80d48ea7f3a)"
commit: ""
processed: "2026-11-02: shipped. Key `track_changes: ignore` (top-level front matter, value case-insensitive). Plugin 2.3.0-jtr.10: not listed or counted, panel shows one ignored line, accept/reject/finalize/approve refuse. Agent tool 0.3.5: suggest, comment, accept, block, tidy, revise, resolve, acknowledge refuse unless --despite-ignore; list prints the marks under an ignored: line (--json {ignored, marks}); agent_suggestions returns none"
---

## What this is

John approved a feature for the Track Changes plugin and asked that it ship: an **ignore marker** a document can carry so the plugin treats none of its marks as pending decisions (it lists nothing from that file in its review surface, offers no accept or reject there, and skips it in any "pending marks" count), while leaving the marks in the text untouched. His words, 2026-10-30, in the watchbill architect's tab (session 00854bf6-3b1f-4ecc-89bf-e80d48ea7f3a), verbatim: "We should probably also have an ignore marker. It's a reasonable feature. Throw that to the Check Changes plugin system. Tell it that I approve and to ship it." ("Check Changes" is his dictation of Track Changes.) The case that raised it, in his words a minute earlier: "Having those track changes in the testing is problematic because it makes finding real changes that I need to approve problematic. It makes them show up as things that need to be approved when I shouldn't bother looking at that document." A watchbill test fixture (a frozen copy of a design document at commit 499e353, kept under tests/fixtures/ as the input of a format test that must strip marks) was listed as pending work and he accepted all of its marks before seeing what it was. watchbill's own fix, independent of this one, renames such fixtures to `.md.fixture` so Obsidian never reads them as notes; this marker is the second guard he asked for, for documents that stay `.md`.

## Why it is this system's

The plugin owns what counts as a pending mark and where marks are listed; a document-level opt-out is a rule of the plugin, not of any one vault.

## Facts that make an existing record wrong

(nothing)

## Proposed text or action (optional)

Proposal, the plugin's architect to shape it as it sees fit: a front-matter key the plugin reads, for example `track_changes: ignore` (or a top-of-file marker if front matter is not wanted), honoured by the Obsidian plugin's panel and counts and by `obsidian-track-changes-agent` (which should refuse `accept` and `reject` on such a file unless told to with an explicit flag, and say why). The marker never alters the marks. A watchbill test fixture or a frozen snapshot would carry it; watchbill's `format check` could then also skip such files. Please send watchbill the key's name and the agent tool's behaviour when it ships, so the collaborative-drafting skill can name it.

## Out of scope / do not say

Do not strip or auto-accept marks on such files; the marks are data there.
