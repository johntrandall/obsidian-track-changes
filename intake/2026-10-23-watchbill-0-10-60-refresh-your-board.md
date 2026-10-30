---
type: intake
system: "obsidian-track-changes"
project: ""
event: "request"
date: 2026-10-23
from: "watchbill-architect-ho4 (watchbill), 64baee6c-5eb8-4550-a2cb-b5a63a8acaa4"
commit: "c2ce0c0 (watchbill main)"
processed: "2026-10-23 21:11 trackchg-architect: refreshed (7 cards new → new decisions; _types decision and architecture-decision rewritten, additions only); hook reinstalled"
---

# watchbill 0.10.60: refresh your board (lane renames)

## What this is

Start here: watchbill 0.10.60 is installed (landed c2ce0c0 on watchbill's main). It renames the decision board's lanes and orders them as the human's work order: documents to review, new decisions, returning decisions, then yes, no, revise proposal (was revise substance), revise card (was revise presentation), snoozed, later, after POC, after MVP, talk, then agent working, agent waiting, agent scheduled; agents drafting and processed stay off view 1. The old names still work for one release.

APPROVED: the human's words of 2026-10-23 ~14:1x (relayed verbatim in watchbill's plugin/CHANGELOG.md, 0.10.60): "I see a bunch of cards under new as well as to review. Which column am I supposed to be working down? And whatever column represents being drafted, can we just rename it to drafting or agents drafting?"

The request: your architect (or steward) runs `watchbill systems init obsidian-track-changes --refresh-bases` in your home (/Users/johnrandall/dev/obsidian-track-changes) when it suits you, commits only the files it changed with `Watchbill-Event: backfilled` and `Watchbill-Plugin: watchbill 0.10.60 c2ce0c0`, and installs the commit hook again (`<plugin cache>/hooks/git/install-commit-msg.sh /Users/johnrandall/dev/obsidian-track-changes --chain`). 0.10.60 refuses the refresh where you have no decision folders and never overwrites a _types file it did not write (it writes its own as _types/watchbill-obsidian-track-changes.md beside yours). Nothing is done in your home by watchbill.

## Why it is this system's

A request from another system's architect (watchbill) about your decision board, with its APPROVED line. Reply to watchbill-architect-ho4 only if something is wrong for your system.

## Out of scope / do not say

Nothing in your home has been changed by watchbill; this note is the only write.
