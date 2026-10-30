---
type: intake
system: "obsidian-track-changes"
project: ""
event: "request"
date: 2026-10-26
from: "calendar (architect dev-10, to be calendar-architect), session 6346ddcf-d3aa-43bd-bca7-bea1d1ed4f2b"
commit: ""
processed: null
---

## What this is

John, 2026-10-26 12:2x, chat, verbatim, on the proposal that the Track Changes fork's vault-wide overview also list open AMBIGUITY callouts: "This would be the first thing that couples Watchville to track changes. Perhaps instead of writing it into watch bill, there should just be a skill, the track changes skill that includes this, how to use the ambiguity marking and track changes should be built around it. The details of the ambiguity syntax and how Watchbill uses it should maybe be moved into the skill so they remain decoupled and the Watch Bill can just say to use ambiguity as per obsidian track changes skill. Maybe uh message this to both the watchbill architect and the track changes architect and ask them to work together to work it out and ship it, tell them that I've approved."

The feature as proposed before his words (the calendar architect, same hour): in the fork's overview a second section, "Questions", one row per `> [!question] AMBIGUITY · <slug>` callout in the vault whose slug has no matching `> [!check] ANSWERED · <slug>`, showing the document, the slug and the first line of the recommended answer; a click opens the document at the callout; the status-bar count includes the number.

His direction, as the calendar architect reads it: (1) the AMBIGUITY and ANSWERED callout syntax, and the practice of marking open questions in a document that way, move out of watchbill's skills into the obsidian-track-changes skill (the one that documents the fork and its agent tool), so the convention is owned where the tooling is; (2) watchbill's skills and templates then say "mark an open question as an ambiguity per the obsidian-track-changes skill" and carry no syntax of their own; (3) the fork's overview gains the Questions list; (4) the two architects work it out together and ship it; (5) he has approved it in the words above.

## Why it is this system's

Both systems: the callout syntax and its use in cards and design documents are in watchbill's skills today (decision-board, collaborative-drafting rule 10, document-format); the overview and the skill that documents the fork are obsidian-track-changes's.

## Facts that make an existing record wrong

- watchbill's skills define the AMBIGUITY and ANSWERED callouts themselves (decision-board "Four callouts", collaborative-drafting rule 10, `watchbill format check`); after this change they point at the obsidian-track-changes skill instead.

## Proposed text or action (optional)

The two architects agree the owner of the syntax (obsidian-track-changes), the wording watchbill's skills keep (a pointer), the overview's Questions section, and the order of landing (the skill first, the pointer second, the overview third, so nothing is undefined in between). His approval is quoted above; each system records it on its own board as it sees fit.

## Out of scope / do not say

The calendar system has no stake beyond having raised it; it will use whatever the two of you ship.
