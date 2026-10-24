---
_human_verdict: agent waiting
title: Mobile test harness cycle
type: decision
kind: approval
weight: quick
asks:
system: obsidian-track-changes
question: Build and land an iPad test harness (WebKit unit run, mobile emulation in the VM, a manual iPad checklist) with an Opus builder, if it fits in a day?
options: []
recommendation: "yes"
unblocks: cycle 2026-10-23-mobile-harness
asked_by: trackchg-architect
asked_at: "2026-10-23T12:10:18-0400"
asked_via: chat
status: answered
applied_at:
applied_how:
undo:
source: relay
recorded_where: relayed by obsidian-track-changes-df, heard by session 988b396b-f824-464e-83db-39e5a05961e0
relayed_by: obsidian-track-changes-df
spawned:
subject:
subject_fingerprint:
human_note:
human_words: "On iPad, how do I make a change in the document that is tracked? Do you have a testing harness that includes, um, testing how this functions in the iPad? How complicated would it be to make one? If that's something that can be done in a day, orchestrate its build, using an Opus builder, to extend the testing suite, so that we can be sure that this all works on iPad, too. I guess you need to use some sort of iOS simulator. We probably have that set up one machine. Check it out.  Also, you should adopt the watch bill system, as it currently exists, you play the architect role, and, uh, once you decide all the next steps and lay them out, you should handle it to a fresh architecture."
snooze_until:
previous_verdict: "yes"
moved_at: "2026-10-24T11:31:08-0400"
moved_by: trackchg-architect
working_by:
waiting_on: "cycle 2026-10-23-mobile-harness gate: jtr.9 release and the VM smoke run, both on John's cards (release jtr.9; Accessibility grants)"
revisit_when:
revisit_of:
revisits:
review_marks:
---
# Mobile test harness cycle

> [!todo] Your move · obsidian-track-changes · trackchg-architect
> Nothing for you: waiting on cycle 2026-10-23-mobile-harness gate: jtr.9 release and the VM smoke run, both on John's cards (release jtr.9; Accessibility grants).

## The question

Build and land an iPad test harness (WebKit unit run, mobile emulation in the VM, a manual iPad checklist) with an Opus builder, if it fits in a day?

**Why:** nothing in this project had ever run on a mobile build, yet Obsidian installs the plugin on your iPad (`isDesktopOnly: false`), so a panel that breaks there would go unnoticed until you hit it.

## Why this is being asked

**Start here.** This card records a yes you already gave in chat: build a test harness for the iPad. It is the approval of record for the first build cycle of this system, `2026-10-23-mobile-harness`; nothing waits on you. It goes to processed when the harness is merged and its gate is written.

**Terms.**
- **Harness**: the tests and scripts that exercise the plugin the way the iPad runs it.
- **WebKit**: the browser engine of iOS; the unit tests run in Playwright's WebKit build to catch JavaScript that works on desktop (Chromium) but not on the iPad.
- **Mobile emulation**: Obsidian desktop's `app.emulateMobile(true)`, which switches a vault to the mobile layout; driven in the project VM `obsidian-track-changes-dev` by `scripts/vm-test.sh`.
- **Why no iOS simulator**: Obsidian for iOS is an App Store build with no simulator binary, so a simulator cannot run it (Verified by the founding session, 2026-10-23).
- **jtr.N**: John's fork builds of the plugin, `2.3.0-jtr.N`.

## Design impact

No design change: the harness adds test tooling (`npm run test:webkit`, `scripts/vm-test.sh mobile|smoke-mobile`), a manual checklist `dev-docs/testing/ipad-checklist.md`, and README / CLAUDE.md sections on what is covered where. If the mobile runs find a defect in the plugin, its fix ships as `2.3.0-jtr.9` and is rolled into your open vaults as before.

**Binds:** the architect (merges, verifies, releases). · **Your part:** nothing new now; later, ten minutes with the iPad checklist on the real device when it is ready (a card of its own). · **Does not change:** how the plugin behaves on desktop.

## Options and consequences

- **yes** (recommended): an Opus builder writes the harness in a day; the architect verifies it cold and merges it. Undo: remove the scripts and docs; nothing in your vaults depends on them.
- **no** (viable): the iPad stays untested until you try it by hand.

## Recommendation

**yes.** Already given; the architect builds within your bound ("if that's something that can be done in a day") and reports what did not fit.

## History

- 2026-10-23 ~12:00 EDT, chat in the founding session's tab ("CriticMarkup comment resolved state", session 8a6e4f5e): the words below. Relayed verbatim and complete to trackchg-architect by `obsidian-track-changes-df` at 12:12 EDT.
- The founding session launched the builder `mobile-harness-builder` (Opus) at 12:0x on branch `feat/mobile-harness`.

## Links

- [[dev-docs/runs/2026-10-23-mobile-harness/briefs/cycle|Cycle brief, with the gate]]
- [[dev-docs/briefs/2026-10-23-mobile-test-harness|The builder's brief]]
- [[dev-docs/build-queue|Build queue (item 1)]]
- [[dev-docs/decisions|Decisions file (row 2026-10-23)]]

## The human's words

> On iPad, how do I make a change in the document that is tracked? Do you have a testing harness that includes, um, testing how this functions in the iPad? How complicated would it be to make one? If that's something that can be done in a day, orchestrate its build, using an Opus builder, to extend the testing suite, so that we can be sure that this all works on iPad, too. I guess you need to use some sort of iOS simulator. We probably have that set up one machine. Check it out.  Also, you should adopt the watch bill system, as it currently exists, you play the architect role, and, uh, once you decide all the next steps and lay them out, you should handle it to a fresh architecture.

(relayed by obsidian-track-changes-df, 2026-10-23T12:10:18-0400, recorded by 988b396b-f824-464e-83db-39e5a05961e0)

## Talk to the agent

- [Focus the agent that asked](http://link.localhost/herdr-jump#988b396b-f824-464e-83db-39e5a05961e0)
- [Focus its workspace](http://link.localhost/herdr-workspace#label=%F0%9F%93%A6%20s-app%20obsidian-track-changes)

## Card log

One line per edit: when, who (name, role, session), what. Written by the `watchbill decide` verbs and `watchbill decisions` sweeps; an agent that edits the card by hand adds its own line the same way.

- 2026-10-23T12:10:18-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · created the card [lane: blank]
- 2026-10-23T12:10:18-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · recorded the human's relayed answer: yes [lane: yes]
- 2026-10-23T12:10:52-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · filled in the card body by hand
- 2026-10-24T11:31:08-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · moved yes → agent waiting (waiting on cycle 2026-10-23-mobile-harness gate: jtr.9 release and the VM smoke run, both on John's cards (release jtr.9; Accessibility grants)) [lane: agent waiting]

## John's comments

Type under the last *John* heading, or answer in chat; drag the card to **revise** when you want the agent to act on what you wrote.

### John
