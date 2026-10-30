---
_human_verdict: new decisions
title: Ship updates without asking (narrowed)
type: decision
kind: decision
weight: quick
asks:
system: obsidian-track-changes
question: May the obsidian-track-changes architect ship updates without asking, narrowed to parser, rendering, styles, and docs fixes released with npm test and the WebKit run green and a render seen, never a change to how accept, reject, or finalize write to your notes?
options: []
recommendation: "yes"
unblocks: "watchbill's AUTO-SHIP switch for this system (your words of 2026-10-29 15:29); the fork releases that today wait on a card each"
asked_by: trackchg-architect
asked_at: "2026-10-29T18:17:55-0400"
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
moved_at: "2026-10-29T18:18:42-0400"
moved_by: trackchg-architect
working_by:
waiting_on:
revisit_when:
revisit_of:
revisits:
review_marks:
---
# Ship updates without asking (narrowed)

> [!todo] Your move · obsidian-track-changes · trackchg-architect
> You are looking at a decision from trackchg-architect. **Your move:** drag it to **yes, show me** to accept the recommendation (yes) and see the design change as Track Changes suggestions first, or to **yes, just do it** to accept it and let trackchg-architect write it plainly and execute at once; or to **no**, **revise proposal**, **revise card**, **later**, **after POC**, **after MVP**, **talk**, or **snoozed**; or answer in chat. **Then:** trackchg-architect acts on your answer.
> Talk to [the agent that wrote this](http://susanbones:5465/herdr-jump#988b396b-f824-464e-83db-39e5a05961e0) · [the seat that holds it now](http://susanbones:5465/herdr-owner#988b396b-f824-464e-83db-39e5a05961e0)

## The question

May the obsidian-track-changes architect ship updates without asking, narrowed to parser, rendering, styles, and docs fixes released with npm test and the WebKit run green and a render seen, never a change to how accept, reject, or finalize write to your notes?

- **Problem:** every fork release waits on a card of yours (jtr.9 has waited since 2026-10-23 with four fixes in it), even for a display fix that changes nothing in your notes.
- **Proposal:** let this project's architect ship display, parser, style, and docs fixes without a card each, after tests, a cold check, and a render seen; never changes to how your notes are written.
- **From:** your words of 2026-10-29 15:29:25 in watchbill's architect's tab, relayed in [[intake/2026-10-29-auto-ship-standing-autonomy|its intake note]].

## Why this is being asked

**Start here.** Watchbill now shows an AUTO-SHIP switch per system, read from a card like this one. You asked watchbill's architect at 15:29 today to turn it on where it fits; its reader assessed every system and recommends this one on, narrowed. The grant is new, so it needs your yes here or in my tab. It answers the standing-autonomy question this project has had open since 2026-10-23.

**Terms.**
- **Fork release**: a new build `2.3.0-jtr.N` of the Track Changes plugin, published as a GitHub release and installed in your open vaults.
- **Write paths**: the code that changes your notes when you accept, reject, or finalize marks (`src/operations.ts`, the edit-apply code in `src/main.ts`, `src/finalize.ts`); a bug there could damage notes.
- **Render seen**: your rule of 2026-10-29: a change that affects what you see ships only after someone has seen it rendered (a screenshot or your own look).

## Design impact

- [[dev-docs/decisions|Decisions file]]: the standing-autonomy row (open since 2026-10-23) answered.
- `watchbill systems show obsidian-track-changes --switches`: AUTO-SHIP on.
- What I could then ship without a card: parser fixes, panel and overview display, styles, tooltips, docs; and the agent tool's fixes that do not change what it writes. Each release still needs `npm test` and the WebKit run green, a cold verifier, and a render seen. I tell you after each one.
- Still asked, one card each: any change to the write paths; any new feature; anything public beyond the fork's own release (the agent tool's public repository); anything on your behalf (credentials, new hosts).

**Binds:** the architect. · **Your part:** yes or no. · **Does not change:** your marks, your approvals, the cards for new features.

## Options and consequences

- **yes** (recommended): display and parser fixes reach your vaults without waiting on a card; you hear about each one after. Undo: say so; the switch goes off.
- **no** (viable): every release keeps waiting on its own card.

## Recommendation

**yes.** The narrowing keeps every change that could damage a note behind your word, and the render rule keeps every visible change behind someone's eyes.

## History

- 2026-10-29 15:29:25, you in watchbill's architect's tab (verbatim, relayed in its intake note): "I see that the release auto ship is off for most projects Launch an agent to take a look at them all and figure out which ones it should be on for and then just turn those on."
- 2026-10-23: the standing-autonomy question was opened by the founding session and never answered.

## Links

- [[intake/2026-10-29-auto-ship-standing-autonomy|Watchbill's intake note]]
- [[dev-docs/substantive/2026-10-23-release-track-changes-2-3-0-jtr-9|Release jtr.9 (would ship on yes, with its render seen)]]

## The human's words

## Talk to the agent

- [Focus the agent that asked](http://susanbones:5465/herdr-jump#988b396b-f824-464e-83db-39e5a05961e0)
- [Focus its workspace](http://susanbones:5465/herdr-workspace#label=%F0%9F%93%A6%20s-app%20obsidian-track-changes)

## Card log

One line per edit: when, who (name, role, session), what. Written by the `watchbill decide` verbs and `watchbill decisions` sweeps; an agent that edits the card by hand adds its own line the same way.

- 2026-10-29T18:17:55-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · created the card [lane: agents drafting]
- 2026-10-29T18:18:42-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · filled in the card body by hand
- 2026-10-29T18:18:42-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · moved agents drafting → new decisions [lane: new decisions]

## John's comments

Type under the last *John* heading, or answer in chat; drag the card to **revise** when you want the agent to act on what you wrote.

### John
