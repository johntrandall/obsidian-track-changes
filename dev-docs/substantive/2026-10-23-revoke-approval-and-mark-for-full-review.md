---
_human_verdict: new decisions
title: Revoke approval and mark for full review
type: decision
kind: decision
weight: quick
asks:
system: obsidian-track-changes
question: "Add two buttons to the review panel: Revoke approval (asks first; removes the approval and keeps a dated line in a revoked: list) and Mark for full review (sets review: whole without revoking), plus a matching revoke command in the agent tool?"
options: []
recommendation: "yes"
unblocks: accepting all changes and then re-reading the note wholesale; undoing an approval
asked_by: trackchg-architect
asked_at: "2026-10-23T18:27:02-0400"
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
moved_at: "2026-10-23T21:11:32-0400"
moved_by: watchbill systems init --refresh-bases
working_by:
waiting_on:
revisit_when:
revisit_of:
revisits:
review_marks:
---
# Revoke approval and mark for full review

> [!todo] Your move · obsidian-track-changes · trackchg-architect
> You are looking at a decision from trackchg-architect. **Your move:** drag it to **yes, show me** to accept the recommendation (yes) and see the design change as Track Changes suggestions first, or to **yes, just do it** to accept it and let trackchg-architect write it plainly and execute at once; or to **no**, **revise proposal**, **revise card**, **later**, **after POC**, **after MVP**, **talk**, or **snoozed**; or answer in chat. **Then:** trackchg-architect acts on your answer.
> Talk to [the agent that wrote this](http://susanbones:5465/herdr-jump#988b396b-f824-464e-83db-39e5a05961e0) · [the seat that holds it now](http://susanbones:5465/herdr-owner#988b396b-f824-464e-83db-39e5a05961e0)

## The question

Add two buttons to the review panel: Revoke approval (asks first; removes the approval and keeps a dated line in a revoked: list) and Mark for full review (sets review: whole without revoking), plus a matching revoke command in the agent tool?

**Why:** with many suggestions you would rather accept them all and re-read the note wholesale, and once you approve there is no way to take the approval back.

## Why this is being asked

**Start here.** You asked watchbill's architect at 18:3x for a Revoke button and for a way to flag a note for a wholesale re-read; your words reached this project through it, so it asks you to confirm here. Your question first, answered: **Accept all never approves a note** (Verified 2026-10-23 18:27 in the code: the panel's only writer of a note's frontmatter is *Approve this version*; *Accept all* only edits the marks in the text). On an approved note, accepting changes the text, so the panel then shows "Changed since approval".

**Terms.**
- **Approval anchor**: the frontmatter *Approve this version* writes: `status: accepted`, `approved_by`, `approved_at`, `approved_via`, `approved_hash`, `approved_sha`, `approved_whole_sha`, and `amended` after later rounds.
- **`review: whole`**: the frontmatter flag that lists a note under *Needs review* in the pending overview and shows "flagged for review" in the panel; watchbill sets it today, and Approve clears it.

## Fields, laid out

- **`revoked`** (new frontmatter list, written by Revoke)
  - what it is: one dated line per revocation, like `amended`
  - values: `"<when> by <who> via <panel or card>; was approved <when> (<hash>, <sha>)"`
  - who reads it: you in Properties, the agent tool's `drift`, watchbill
  - default: absent
- **`review: whole`** (existing), now also written by *Mark for full review*.

## Options and consequences

- **yes** (recommended): the panel gets **Revoke approval** (shown while the note is approved; asks first; removes the anchor's fields and adds the `revoked` line; the note then reads as needs review) and **Mark for full review** (sets `review: whole` only; the old approval stays visible as "Last approved …" until you approve again). The agent tool gets `revoke <note> --by --via`, refused without the record of your act, as `approve` is. Watchbill's architect agreed the design and the contract change (18:3x). Ships with the next fork build. Undo: approve again.
- **no** (viable): you keep approving only when sure; an approval is undone by hand in Properties.

## Design impact

- Review panel: two buttons as above.
- [[dev-docs/contracts/watchbill|Contract with watchbill]]: today only watchbill writes `review:`; after, your click writes it too; a `revoked` list is added.
- Agent tool: a `revoke` command; `drift --json` reports `revoked_rounds`.

**Binds:** the architect; watchbill's readers (its practice lead updates them). · **Your part:** nothing after a yes. · **Does not change:** Approve, Accept all, Reject all.

## Recommendation

**yes.** It gives you a way back from an approval that leaves an honest record, and a one-click "re-read all of this" after Accept all.

## History

- 2026-10-23 18:3x, in the watchbill architect's pane (verbatim, relayed in its intake note): "Sometimes there's so many track changes in a document that I'd rather just accept all the changes and mark it as unreviewed and then have to review it again wholesale. I'm scared to hit accept all because I don't want to uh mistakenly approve the document just by accepting the track changes. Can you look into how track changes works and confirm for me that that's not going to happen if I hit accept all? And also, once I hit approve this version, there needs to be a button to revoke the approval."

## Links

- [[intake/2026-10-23-revoke-approval-and-mark-for-full-review|Watchbill's intake note]]
- [Approval anchor and drift design](file:///Users/johnrandall/dev/claude-plugin-obsidian-track-changes-agent/dev-docs/design/approval-anchor-and-drift.md)

## The human's words

## Talk to the agent

- [Focus the agent that asked](http://susanbones:5465/herdr-jump#988b396b-f824-464e-83db-39e5a05961e0)
- [Focus its workspace](http://susanbones:5465/herdr-workspace#label=%F0%9F%93%A6%20s-app%20obsidian-track-changes)

## Card log

One line per edit: when, who (name, role, session), what. Written by the `watchbill decide` verbs and `watchbill decisions` sweeps; an agent that edits the card by hand adds its own line the same way.

- 2026-10-23T18:27:02-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · created the card [lane: agent drafting]
- 2026-10-23T18:27:38-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · filled in the card body by hand
- 2026-10-23T18:27:39-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · moved agent drafting → new [lane: new]
- 2026-10-23T21:11:32-0400 · watchbill systems init --refresh-bases (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · lane new → new decisions by the 0.10.50 refresh (new is now new decisions); earlier mover trackchg-architect at 2026-10-23T18:27:39-0400 [lane: new decisions]
- 2026-10-25T10:52:46-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · rewrote the Your move callout to the current wording (watchbill decisions your-move, 0.10.69)
- 2026-10-29T18:16:43-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · rewrote the Your move callout to the current wording, and its herdr links on the bridge's host (watchbill decisions your-move, 0.10.69) (held in agent editing from new decisions, back to new decisions)
- 2026-10-29T18:16:43-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · the Your move backfill: refreshed the card (held in agent editing from new decisions), then back in new decisions

## John's comments

Type under the last *John* heading, or answer in chat; drag the card to **revise** when you want the agent to act on what you wrote.

### John
