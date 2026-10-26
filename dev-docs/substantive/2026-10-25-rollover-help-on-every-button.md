---
_human_verdict: yes, show me
title: Rollover help on every button
type: decision
kind: approval
weight: quick
asks:
system: obsidian-track-changes
question: Give every button in the review panel and the overview a rollover (hover tooltip) that says what it does and what it does not do?
options: []
recommendation: "yes"
unblocks:
asked_by: trackchg-architect
asked_at: "2026-10-25T23:18:25-0400"
asked_via: chat
status: answered
applied_at:
applied_how:
undo:
source: chat
recorded_where: chat, heard by session 988b396b-f824-464e-83db-39e5a05961e0
relayed_by:
spawned:
subject:
subject_fingerprint:
human_note:
human_words: Every button should have a rollover state that gives more info about what it does.
snooze_until:
previous_verdict: yes, show me
moved_at: "2026-10-25T23:22:14-0400"
moved_by: trackchg-architect
working_by:
waiting_on:
revisit_when:
revisit_of:
revisits:
review_marks:
---
# Rollover help on every button

> [!todo] Your move · obsidian-track-changes · trackchg-architect
> You answered **yes, show me**. trackchg-architect picks it up next and puts any design change in front of you as Track Changes suggestions before it executes; nothing more for you until then.

## The question

Give every button in the review panel and the overview a rollover (hover tooltip) that says what it does and what it does not do?

**Why:** the panel's icon buttons (a check, an X, a trash can) and its header buttons gave no hint of what they do, what they keep, or what they do not do, so a click could surprise you (Accept all looked as if it might approve the note).

## Why this is being asked

**Start here.** This card records an instruction you gave in chat on 2026-10-25, built the same evening; nothing waits on you. Every button in the review panel and the pending overview now shows a hover tooltip (a "rollover") of one or two sentences: what the click does, what stays in the note, and what it does not do.

**Terms.**
- **Rollover / tooltip**: the text Obsidian shows when the pointer rests on a control; the plugin sets it as the button's `aria-label`, which also reads it aloud for assistive technology.
- **Review panel**: the right-side list of suggestion, comment and highlight cards; **overview**: the vault-wide list of notes with pending changes.

## Design impact

No design change: the buttons behave as before; each gains hover text. Examples: Accept, "Accept this suggestion: apply the change to the text. A comment attached to it stays in the note, marked resolved. This never approves the whole note."; Accept all, "…after confirming the count. Comments and highlights stay. This never approves the note."; Delete thread, "…To keep it as a record, use Mark resolved instead." The rule is now in the project's CLAUDE.md: a new button without a rollover is a defect.

**Binds:** the architect. · **Your part:** none; on the iPad, a long press shows the same text. · **Does not change:** what any button does.

## Options and consequences

- **yes** (recommended): shipped in the next fork build. Undo: remove the labels.
- **no** (viable): buttons stay unlabelled.

## Recommendation

**yes.** Already given; built (commit 704f1a7 on the build branch).

## History

- 2026-10-25, you in chat (verbatim, below).

## Links

- [[dev-docs/substantive/2026-10-23-release-track-changes-2-3-0-jtr-9|Release Track Changes 2.3.0-jtr.9 (ships it)]]

## The human's words

> Every button should have a rollover state that gives more info about what it does.

(in chat, 2026-10-25T23:16:04-0400, recorded by 988b396b-f824-464e-83db-39e5a05961e0)

## Talk to the agent

- [Focus the agent that asked](http://link.localhost/herdr-jump#988b396b-f824-464e-83db-39e5a05961e0)
- [Focus its workspace](http://link.localhost/herdr-workspace#label=%F0%9F%93%A6%20s-app%20obsidian-track-changes)

## Card log

One line per edit: when, who (name, role, session), what. Written by the `watchbill decide` verbs and `watchbill decisions` sweeps; an agent that edits the card by hand adds its own line the same way.

- 2026-10-25T23:18:25-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · created the card [lane: blank]
- 2026-10-25T23:18:25-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · recorded the human's chat answer: yes, show me [lane: yes, show me]
- 2026-10-25T23:21:38-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · moved yes, show me → agent editing [lane: agent editing]
- 2026-10-25T23:22:08-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · filled in the card body by hand
- 2026-10-25T23:22:14-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · moved agent editing → yes, show me (done editing) [lane: yes, show me]

## John's comments

Type under the last *John* heading, or answer in chat; drag the card to **revise** when you want the agent to act on what you wrote.

### John
