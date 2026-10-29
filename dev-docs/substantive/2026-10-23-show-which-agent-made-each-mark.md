---
_human_verdict: new decisions
title: Show which agent made each mark
type: decision
kind: decision
weight: quick
system: obsidian-track-changes
question: "Sign each agent's mark with its seat and session as two extra keys (seat=\"watchbill-copy-editor\" session=\"a9965d0d\") next to the unchanged author \"Claude (editor)\", and show them on each card in the review panel, as you asked watchbill's architect at 15:1x?"
options: ["separate keys", "longer author"]
recommendation: separate keys
unblocks: telling apart the watchbill seats that mark one document
asked_by: trackchg-architect
asked_at: "2026-10-23T15:16:05-0400"
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
# Show which agent made each mark

> [!todo] Your move · obsidian-track-changes · trackchg-architect
> You are looking at a decision from trackchg-architect. **Your move:** drag it to **yes, show me** to accept the recommendation (separate keys) and see the design change as Track Changes suggestions first, or to **yes, just do it** to accept it and let trackchg-architect write it plainly and execute at once; or to **no**, **revise proposal**, **revise card**, **later**, **after POC**, **after MVP**, **talk**, or **snoozed**; or answer in chat. **Then:** trackchg-architect acts on your answer.
> Talk to [the agent that wrote this](http://susanbones:5465/herdr-jump#988b396b-f824-464e-83db-39e5a05961e0) · [the seat that holds it now](http://susanbones:5465/herdr-owner#988b396b-f824-464e-83db-39e5a05961e0)

## The question

Sign each agent's mark with its seat and session as two extra keys (seat="watchbill-copy-editor" session="a9965d0d") next to the unchanged author "Claude (editor)", and show them on each card in the review panel, as you asked watchbill's architect at 15:1x?

**Why:** every agent's mark says only "Claude (editor)", so when several watchbill seats mark one document in an afternoon you cannot tell which one made a change.

## Why this is being asked

**Start here.** You asked watchbill's architect at 15:1x to make each mark show its seat and session; your words reached this project through that architect, so it asks you to confirm here. There is also one design choice: put the identity into the author name, or next to it. Nothing else waits on this.

**Terms.**
- **Mark**: one Track Changes suggestion or comment in a note, with a prefix such as `author="Claude (editor)" date="2026-10-23"`.
- **Seat**: a standing agent role in a watchbill system, named like `watchbill-copy-editor`; **session**: one Claude conversation, shown as the first 8 characters of its id (`a9965d0d`).
- **Role**: what the agent may do on the document (`editor` may suggest text; `checker` may only comment); the agent tool checks it from the author name.

## Fields, laid out

- **`seat`** (new key in a mark's prefix)
  - what it is: the agent's seat name, from the herdr session name; `--seat` overrides it
  - values: any seat name; absent for your own marks and for agents outside herdr
  - who reads it: the review panel (shown on the card), the agent tool's `list`, watchbill
  - default: absent
- **`session`** (new key)
  - what it is: the first 8 characters of the agent's Claude session id
  - values: 8 hex characters; absent when unknown
  - who reads it: as `seat`; the full id is not written
  - default: absent

## Options and consequences

- **separate keys** (recommended): `{author="Claude (editor)" seat="watchbill-copy-editor" session="a9965d0d" date="…"~~old~>new~~}`. The card shows "Claude (editor) · watchbill-copy-editor · a9965d0d". The role checks, the author colours and older plugin builds keep working unchanged; a relieved seat can still revise its predecessor's marks. Undo: stop writing the keys; old marks keep them harmlessly.
- **longer author** (viable): `author="Claude (editor · watchbill-copy-editor · a9965d0d)"`, watchbill's first proposal. One string, readable even in plain text; but every session gets its own author colour, long names truncate on the iPad, and every ownership check in the agent tool must learn to read the role out of it.

## Design impact

- Agent tool (next version): writes `seat` and `session` on every mark it makes; `list` prints them.
- Plugin (next fork build): each card shows seat and session after the author; nothing else changes.
- Watchbill: reads the keys; no caller changes.

**Binds:** the architect; watchbill's architect (agreed the need; the form is under discussion with it). · **Your part:** pick the form. · **Does not change:** your own author name, the resolved and acknowledged flags, approval.

## Recommendation

**separate keys.** Same information on every card, with none of the side effects of changing the author name.

## History

- 2026-10-23 15:1x, in the watchbill architect's pane (verbatim, relayed in its intake note): "In changes, I need to see what seat and session are actually making the change. Right now it just says Claude Editor. It needs to be clear to me if it's you, one of your helpers, or the document steward. I believe this is accounted for in our Obsidian Track Changes plugin. So coordinate with the architect of that system to make it happen."

## Links

- [[intake/2026-10-23-marks-signed-with-seat-and-session|Watchbill's intake note]]
- [[dev-docs/build-queue|Build queue]]

## The human's words

## Talk to the agent

- [Focus the agent that asked](http://susanbones:5465/herdr-jump#988b396b-f824-464e-83db-39e5a05961e0)
- [Focus its workspace](http://susanbones:5465/herdr-workspace#label=%F0%9F%93%A6%20s-app%20obsidian-track-changes)

## Card log

One line per edit: when, who (name, role, session), what. Written by the `watchbill decide` verbs and `watchbill decisions` sweeps; an agent that edits the card by hand adds its own line the same way.

- 2026-10-23T15:16:05-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · created the card [lane: agent drafting]
- 2026-10-23T15:16:33-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · filled in the card body by hand
- 2026-10-23T15:16:34-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · moved agent drafting → new [lane: new]
- 2026-10-23T15:18:45-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · replied: Watchbill's architect agreed the separate-keys form at 15:2x: it reads marks through the agent tool and by your author…
- 2026-10-23T21:11:32-0400 · watchbill systems init --refresh-bases (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · lane new → new decisions by the 0.10.50 refresh (new is now new decisions); earlier mover trackchg-architect at 2026-10-23T15:16:34-0400 [lane: new decisions]
- 2026-10-25T10:52:46-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · rewrote the Your move callout to the current wording (watchbill decisions your-move, 0.10.69)
- 2026-10-29T18:16:43-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · rewrote the Your move callout to the current wording, and its herdr links on the bridge's host (watchbill decisions your-move, 0.10.69) (held in agent editing from new decisions, back to new decisions)
- 2026-10-29T18:16:43-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · the Your move backfill: refreshed the card (held in agent editing from new decisions), then back in new decisions

## John's comments

Type under the last *John* heading, or answer in chat; drag the card to **revise** when you want the agent to act on what you wrote.

### trackchg-architect · 2026-10-23 15:18

Watchbill's architect agreed the separate-keys form at 15:2x: it reads marks through the agent tool and by your author name, which the new keys leave untouched, and its relief rule needs ownership to stay with the role. So the only open question here is yours. Record: [[dev-docs/runs/2026-10-23-marks-seat-session/exchange|the exchange]].

### John
