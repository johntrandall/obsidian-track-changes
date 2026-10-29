---
_human_verdict: new decisions
title: Own the AMBIGUITY callouts; list open questions
type: decision
kind: decision
weight: quick
asks:
system: obsidian-track-changes
question: "Move the AMBIGUITY / ANSWERED callout syntax into this project's agent skill (watchbill then only points at it), add an agent-tool command that lists open ambiguities, and give the overview a Questions section with a status-bar count, as you told the calendar architect at 12:2x?"
options: []
recommendation: "yes"
unblocks: "watchbill 0.10.73 (its skills shrink to a pointer); the overview's Questions section (fork jtr.10)"
asked_by: trackchg-architect
asked_at: "2026-10-26T12:23:00-0400"
asked_via: chat
status: open
applied_at:
applied_how:
undo:
source:
recorded_where:
relayed_by:
spawned:
subject:
subject_fingerprint:
human_note:
human_words:
snooze_until:
previous_verdict:
moved_at: "2026-10-26T12:23:31-0400"
moved_by: trackchg-architect
working_by:
waiting_on:
revisit_when:
revisit_of:
revisits:
review_marks:
---
# Own the AMBIGUITY callouts; list open questions

> [!todo] Your move · obsidian-track-changes · trackchg-architect
> You are looking at a decision from trackchg-architect. **Your move:** drag it to **yes, show me** to accept the recommendation (yes) and see the design change as Track Changes suggestions first, or to **yes, just do it** to accept it and let trackchg-architect write it plainly and execute at once; or to **no**, **revise proposal**, **revise card**, **later**, **after POC**, **after MVP**, **talk**, or **snoozed**; or answer in chat. **Then:** trackchg-architect acts on your answer.
> Talk to [the agent that wrote this](http://susanbones:5465/herdr-jump#988b396b-f824-464e-83db-39e5a05961e0) · [the seat that holds it now](http://susanbones:5465/herdr-owner#988b396b-f824-464e-83db-39e5a05961e0)

## The question

Move the AMBIGUITY / ANSWERED callout syntax into this project's agent skill (watchbill then only points at it), add an agent-tool command that lists open ambiguities, and give the overview a Questions section with a status-bar count, as you told the calendar architect at 12:2x?

**Why:** today the rule for marking an open question in a document (the AMBIGUITY callout) lives in watchbill's skills, so watchbill and Track Changes are coupled by it; you said the syntax should live with the Track Changes tooling, watchbill should only point at it, and the overview should list the open questions.

## Why this is being asked

**Start here.** You told the calendar system's architect this at 12:2x today, and it relayed your words to watchbill's architect and me. Because they reached me by relay, this card asks you to confirm before I land anything; the two architects have agreed the split and the order. A yes starts the build.

**Terms.**
- **AMBIGUITY callout**: `> [!question] AMBIGUITY · <slug>` in a document, with the readings weighed and one recommendation; an agent's way of leaving one open question where it arises.
- **ANSWERED callout**: `> [!check] ANSWERED · <slug>` quoting your answer with time and channel; it closes the question.
- **Agent tool skill**: instructions agents load from the `obsidian-track-changes-agent` plugin; the convention would live in a new skill there, `obsidian-track-changes-agent:ambiguity`.
- **Overview**: the fork's vault-wide list of notes with pending changes; it would gain a *Questions* group.

## Design impact

- Agent tool 0.4.0: the new skill (the two callouts' exact form and when to use them) and a read command, `ambiguities <note or folder> --json`, listing every open callout (no ANSWERED with the same slug).
- Watchbill's skills: shrink to "an open question is an AMBIGUITY callout as the Track Changes skill defines it"; its card link from an ambiguity stays its own. Watchbill's architect lands that after 0.4.0.
- The fork (jtr.10): the overview's *Questions* group, one row per open callout (document, slug, the recommendation's first line; click opens the note at it); the status bar counts them.

**Binds:** the architect; watchbill's architect. · **Your part:** confirm here; release words for jtr.10 later, as for every fork build. · **Does not change:** the marks, the approval record, how watchbill links a callout to a card.

## Options and consequences

- **yes** (recommended): built in the order above (0.4.0, then watchbill's pointer, then jtr.10), so nothing is undefined in between. Undo: watchbill restores its own wording; the overview group can be hidden.
- **no** (viable): watchbill keeps owning the syntax; the overview stays as it is.

## Recommendation

**yes.** It is what you asked for, and it puts the convention where the tooling that reads it lives.

## History

- 2026-10-26 12:2x, you in chat to the calendar architect (verbatim, from its intake note): "This would be the first thing that couples Watchville to track changes. Perhaps instead of writing it into watch bill, there should just be a skill, the track changes skill that includes this, how to use the ambiguity marking and track changes should be built around it. The details of the ambiguity syntax and how Watchbill uses it should maybe be moved into the skill so they remain decoupled and the Watch Bill can just say to use ambiguity as per obsidian track changes skill. Maybe uh message this to both the watchbill architect and the track changes architect and ask them to work together to work it out and ship it, tell them that I've approved."

## Links

- [[intake/2026-10-26-ambiguity-syntax-and-questions-overview|The calendar architect's intake note]]
- [[dev-docs/runs/2026-10-26-ambiguity/design|The design agreed with watchbill]]

## The human's words

## Talk to the agent

- [Focus the agent that asked](http://susanbones:5465/herdr-jump#988b396b-f824-464e-83db-39e5a05961e0)
- [Focus its workspace](http://susanbones:5465/herdr-workspace#label=%F0%9F%93%A6%20s-app%20obsidian-track-changes)

## Card log

One line per edit: when, who (name, role, session), what. Written by the `watchbill decide` verbs and `watchbill decisions` sweeps; an agent that edits the card by hand adds its own line the same way.

- 2026-10-26T12:23:00-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · created the card [lane: agents drafting]
- 2026-10-26T12:23:31-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · filled in the card body by hand
- 2026-10-26T12:23:31-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · moved agents drafting → new decisions [lane: new decisions]
- 2026-10-29T18:16:43-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · rewrote the Your move callout to the current wording, and its herdr links on the bridge's host (watchbill decisions your-move, 0.10.69) (held in agent editing from new decisions, back to new decisions)
- 2026-10-29T18:16:43-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · the Your move backfill: refreshed the card (held in agent editing from new decisions), then back in new decisions

## John's comments

Type under the last *John* heading, or answer in chat; drag the card to **revise** when you want the agent to act on what you wrote.

### John
