---
_human_verdict: new decisions
title: "Confirm: signed property edits"
type: decision
kind: decision
weight: quick
system: obsidian-track-changes
question: "Build a property-edit log into the Track Changes plugin, so that watchbill can tell your property edits (a Base drag, the Properties panel) from an agent's, as you asked watchbill's architect this afternoon?"
options: []
recommendation: "yes"
unblocks: "build-queue item 11; watchbill's commit of your board drags"
asked_by: trackchg-architect
asked_at: "2026-10-23T13:49:46-0400"
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
# Confirm: signed property edits

> [!todo] Your move · obsidian-track-changes · trackchg-architect
> You are looking at a decision from trackchg-architect. **Your move:** drag it to **yes** to accept the recommendation (yes), or to **no**, **revise substance**, **revise presentation**, **later**, **talk** or **snoozed**; or answer in chat. **Then:** trackchg-architect acts on your answer.

## The question

Build a property-edit log into the Track Changes plugin, so that watchbill can tell your property edits (a Base drag, the Properties panel) from an agent's, as you asked watchbill's architect this afternoon?

**Why:** when you drag a card on a board, watchbill records it as your answer; today nothing tells it whether that property was changed by you or by an agent, so an agent's edit could be credited to you.

## Why this is being asked

**Start here.** You asked watchbill's architect this afternoon to hand this need to the Track Changes project. Your words reached this project only through that architect, so before building a new feature into the plugin it asks you to confirm here. The two architects have agreed what to build; a yes starts the design and the first test.

**Terms.**
- **Property**: a frontmatter field of a note, shown in Obsidian's Properties panel; a drag of a card on a Base board (an Obsidian database view) writes one, for example `_human_verdict`.
- **Trusted input**: a real click or key press. Obsidian's windows mark these as trusted, and script code running inside Obsidian cannot fake them; GUI automation from outside could, but agents are not granted that on your Macs (Inferred).
- **Agent tool**: `obsidian-track-changes-agent`, the command agents use to read and write Track Changes marks.

## Design impact

- The Track Changes plugin: today it records nothing about property edits. After: it keeps a log of each property change in a vault (property, old value, new value, when), signed with your configured name when the change came right after a real click or key press in that window, unsigned otherwise; kept 7 days or the last 50 entries per note; stored through Obsidian's own plugin data, nothing added to your notes.
- The agent tool: a new read command, `property-log <note> --json`.
- Watchbill: reads the log when it commits your drag and copies the evidence into its own records.

**Binds:** the architect (design, build, verify), watchbill's architect (its reader). · **Your part:** nothing after a yes; the design comes back to you only if the first test shows a Base drag cannot be seen by a plugin. · **Does not change:** your notes' content; the review marks.

## Options and consequences

- **yes** (recommended): designed and built as build-queue item 11, after the project VM is ready (it needs the VM to test a Base drag safely). Undo: switch the log off in settings; the agent tool then reports "no log".
- **no** (viable): watchbill keeps guessing from its own card logs, which any agent can write.

## Recommendation

**yes.** It makes "you made this edit" a recorded fact instead of a guess for every careless agent. It does not stop an agent that sets out to forge your answer: that needs something like a Touch ID-gated signature and stays on watchbill's card "Make approvals checkable, not asserted".

## History

- 2026-10-23, early afternoon, in the watchbill architect's pane (verbatim, relayed in its intake note): "The Telling Johns front matter edit from an agent's should be solved by the Obsidian plugin system. So put a note there and throw the need over the wall to the Obsidian track changes. And that can be an open loop, but it should have a card to track it that comes under waiting for other systems."
- 13:49–13:5x EDT: the two architects agreed the scope (careless agents only; vault-level log; Base drag and Properties panel).

## Links

- [[dev-docs/runs/2026-10-23-signed-property-edits/exchange|The exchange and the agreed plan]]
- [[intake/2026-10-23-signed-property-edits|Watchbill's intake note]]
- [[dev-docs/build-queue|Build queue (item 11)]]

## The human's words

## Talk to the agent

- [Focus the agent that asked](http://link.localhost/herdr-jump#988b396b-f824-464e-83db-39e5a05961e0)
- [Focus its workspace](http://link.localhost/herdr-workspace#label=%F0%9F%93%A6%20s-app%20obsidian-track-changes)

## Card log

One line per edit: when, who (name, role, session), what. Written by the `watchbill decide` verbs and `watchbill decisions` sweeps; an agent that edits the card by hand adds its own line the same way.

- 2026-10-23T13:49:46-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · created the card [lane: agent drafting]
- 2026-10-23T13:53:05-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · filled in the card body by hand
- 2026-10-23T13:53:05-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · moved agent drafting → new [lane: new]
- 2026-10-23T21:11:32-0400 · watchbill systems init --refresh-bases (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · lane new → new decisions by the 0.10.50 refresh (new is now new decisions); earlier mover trackchg-architect at 2026-10-23T13:53:05-0400 [lane: new decisions]

## John's comments

Type under the last *John* heading, or answer in chat; drag the card to **revise** when you want the agent to act on what you wrote.

### John
