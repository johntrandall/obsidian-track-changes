---
_human_verdict: processed
title: Ship the ignore marker
type: decision
kind: decision
weight: quick
asks:
system: obsidian-track-changes
question: "Ship the ignore marker (a note whose front matter says track_changes: ignore keeps its marks as data: the plugin lists and counts none of them and offers no accept or reject there, and the agent tool refuses to act on them) as agent tool 0.3.3 and in the next fork release?"
options: []
recommendation: "Yes: you asked for it in watchbill's tab this morning; this card is the confirmation a relay from another system needs. The agent tool part is built and tested on a branch; the plugin part is being built; the fork release still goes through its own card."
unblocks: agent tool 0.3.3 to main; the plugin change into the next fork release
asked_by: trackchg-architect-ho2
asked_at: "2026-10-30T11:07:04-0400"
asked_via: chat
status: applied
applied_at: "2026-11-02T10:39:26-0500"
applied_how: "Shipped: Track Changes 2.3.0-jtr.10 (deployed f99dc0e, GitHub release) and obsidian-track-changes-agent 0.3.5 (main 0f9ca2f); checked by eye in the test vault ([[dev-docs/runs/2026-10-30-ignore-marker/visual-check|visual check]])"
undo:
source: chat
recorded_where: chat, heard by session 853fcbfc-75c6-4d94-88e7-97c6d1d942f2
relayed_by:
spawned:
subject:
subject_fingerprint:
human_note: Auto release mode (decisions.md, 2026-11-02) covers this card.
human_words: You can ship freely now in uh auto release mode.
snooze_until:
previous_verdict: yes, just do it
moved_at: "2026-11-02T10:39:26-0500"
moved_by: trackchg-architect-ho2
working_by:
waiting_on:
revisit_when:
revisit_of:
revisits:
review_marks:
---
# Ship the ignore marker

> [!todo] Your move · obsidian-track-changes · trackchg-architect-ho2
> Done: applied (Shipped: Track Changes 2.3.0-jtr.10 (deployed f99dc0e, GitHub release) and obsidian-track-changes-agent 0.3.5 (main 0f9…).
> Talk to [the agent that wrote this](http://susanbones:5465/herdr-jump#853fcbfc-75c6-4d94-88e7-97c6d1d942f2) · [the seat that holds it now](http://susanbones:5465/herdr-owner#853fcbfc-75c6-4d94-88e7-97c6d1d942f2)

## The question

Ship the ignore marker (a note whose front matter says track_changes: ignore keeps its marks as data: the plugin lists and counts none of them and offers no accept or reject there, and the agent tool refuses to act on them) as agent tool 0.3.3 and in the next fork release?

- **Problem:** documents whose marks are data, such as a test fixture or a frozen snapshot, show up as pending review work, so you spend time on them; this morning you accepted every mark in a watchbill test fixture before you saw what it was.
- **Proposal:** a note whose front matter has the line `track_changes: ignore` is left out of every review surface and count, and no tool accepts, rejects or edits its marks; the marks themselves stay exactly as they are.
- **From:** your words in the watchbill architect's tab on 2026-10-30, relayed verbatim by watchbill-architect-ho10: "We should probably also have an ignore marker. It's a reasonable feature. Throw that to the Check Changes plugin system. Tell it that I approve and to ship it." Intake [[intake/2026-10-30-an-ignore-marker-for-a-document-s-marks-john-app|ignore marker intake]].

## Why this is being asked

**Start here.** This card confirms a feature you asked for in another project's tab. A request that reaches this project second-hand counts as a lead until you confirm it here or in chat, so the feature is built on branches but nothing ships until you say yes. With a yes, the agent tool's part goes live at once (version 0.3.3), and the plugin's part rides in the next fork release, which still needs its own yes (the card [[dev-docs/substantive/2026-10-23-release-track-changes-2-3-0-jtr-9|Release Track Changes 2.3.0-jtr.9]]).

**Terms.**
- **Mark:** a CriticMarkup suggestion, comment or highlight in a note (`{++…++}`, `{>>…<<}` and so on).
- **Front matter:** the `---` block at the top of a note.
- **The plugin:** your Track Changes fork in Obsidian (review panel, pending overview, status-bar count).
- **The agent tool:** `obsidian-track-changes-agent`, the command agents use to write and accept marks.
- **Fork release:** a tagged build of the plugin (`2.3.0-jtr.N`) rolled into your vaults.

## Design impact

Design: [[dev-docs/runs/2026-10-30-ignore-marker/design|the ignore marker design]].

**`track_changes`** (front-matter key, top level)
- `ignore`: the note's marks are data. Any other value, or no key: a normal note.
- Read by the plugin and the agent tool; default absent.

- **Plugin:** the overview, the status-bar count and the review groups skip the note (ignore beats `review: whole`); its review panel shows one line saying it is ignored, with no cards and no buttons; accept, reject, resolve, remove-comments, finalize and approve refuse on it. The marks still render inline. Copy clean markdown and your own authoring commands still work.
- **Agent tool 0.3.3:** every verb that writes or decides marks refuses on the note unless `--despite-ignore`; `list` still shows the marks under an `ignored:` line; watchbill's review sweep finds nothing to wait on there. Also in 0.3.3: a card's `[[note]]` link licenses only that exact path (watchbill's request).

**Binds:** every agent using the agent tool; watchbill's review sweep. · **Your part:** nothing new; the plugin part reaches your vaults with the next fork release, on its own card. · **Does not change:** the marks in an ignored note are never stripped, accepted or tidied; a note without the line behaves exactly as today.

## Options and consequences

- **yes** (recommended): agent tool 0.3.3 goes to main and live; the plugin change is merged for the next fork release; watchbill is told the key so its skills and format check can name it. Undoing it: delete the line from a note, or revert one commit in each project.
- **no** (viable): both branches are dropped; watchbill's own fix (renaming its fixtures to `.md.fixture`, so Obsidian never reads them) still keeps its test files out of your review, but any other frozen `.md` copy can still show up as pending work.

## Recommendation

**Yes: you asked for it in watchbill's tab this morning; this card is the confirmation a relay from another system needs. The agent tool part is built and tested on a branch; the plugin part is being built; the fork release still goes through its own card.** On a yes the architect merges agent tool 0.3.3, tells watchbill the key, and merges the plugin change into the fork's integration branch.

## History

2026-10-30, in the watchbill architect's tab: a watchbill test fixture (a frozen design document under `tests/fixtures/`) appeared as pending work and you accepted its marks; your words then: "Having those track changes in the testing is problematic because it makes finding real changes that I need to approve problematic." A minute later you asked for the ignore marker (quoted under Problem). watchbill-architect-ho10 filed the intake (7061773).

## Links

- [[intake/2026-10-30-an-ignore-marker-for-a-document-s-marks-john-app|The intake from watchbill]]
- [[dev-docs/runs/2026-10-30-ignore-marker/design|The design]]
- [[dev-docs/substantive/2026-10-23-release-track-changes-2-3-0-jtr-9|The fork release card]]

## The human's words

> You can ship freely now in uh auto release mode.

(in chat, 2026-11-02T10:37:22-0500, recorded by 853fcbfc-75c6-4d94-88e7-97c6d1d942f2)

## Talk to the agent

- [Focus the agent that asked](http://susanbones:5465/herdr-jump#853fcbfc-75c6-4d94-88e7-97c6d1d942f2)
- [Focus its workspace](http://susanbones:5465/herdr-workspace#label=%3F%20%F0%9F%93%A6%20s-app%20obsidian-track-changes)

## Card log

One line per edit: when, who (name, role, session), what. Written by the `watchbill decide` verbs and `watchbill decisions` sweeps; an agent that edits the card by hand adds its own line the same way.

- 2026-10-30T11:07:04-0400 · trackchg-architect-ho2 (architect, session 853fcbfc-75c6-4d94-88e7-97c6d1d942f2) · created the card [lane: agents drafting]
- 2026-10-30T11:07:42-0400 · trackchg-architect-ho2 (architect, session 853fcbfc-75c6-4d94-88e7-97c6d1d942f2) · moved agents drafting → new decisions [lane: new decisions]
- 2026-11-02T10:39:13-0500 · trackchg-architect-ho2 (architect, session 853fcbfc-75c6-4d94-88e7-97c6d1d942f2) · recorded the human's chat answer: yes, just do it (held in agent editing from new decisions, then yes, just do it) [lane: yes, just do it]
- 2026-11-02T10:39:26-0500 · trackchg-architect-ho2 (architect, session 853fcbfc-75c6-4d94-88e7-97c6d1d942f2) · applied: Shipped: Track Changes 2.3.0-jtr.10 (deployed f99dc0e, GitHub release) and obsidian-track-changes-agent 0.3.5 (main 0f9ca2f); checked by eye in the test vault ([[dev-docs/runs/2026-10-30-ignore-marker/visual-check|visual check]]); moved to processed (held in agent editing from yes, just do it, then processed) [lane: processed]

## John's comments

Type under the last *John* heading, or answer in chat; drag the card to **revise** when you want the agent to act on what you wrote.

### trackchg-architect-ho2 · 2026-11-02 10:39

Applied: Shipped: Track Changes 2.3.0-jtr.10 (deployed f99dc0e, GitHub release) and obsidian-track-changes-agent 0.3.5 (main 0f9ca2f); checked by eye in the test vault ([[dev-docs/runs/2026-10-30-ignore-marker/visual-check|visual check]])

### John
