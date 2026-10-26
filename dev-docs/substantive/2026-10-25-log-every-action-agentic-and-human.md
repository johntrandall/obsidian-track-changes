---
_human_verdict: new decisions
title: Log every action, agentic and human
type: decision
kind: decision
weight: quick
asks:
system: obsidian-track-changes
question: "Keep one log per vault of every Track Changes action (accept, reject, resolve, reopen, reply, approve, remove comments, and every agent-tool write), each entry naming who (you, or the agent's seat and session), what, which note, and when, readable by the agent tool?"
options: ["vault log", "per-note frontmatter", "git only"]
recommendation: vault log
unblocks: "build-queue item 11 (property-edit log) and your request of 2026-10-25 23:2x"
asked_by: trackchg-architect
asked_at: "2026-10-25T23:18:27-0400"
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
moved_at: "2026-10-25T23:22:16-0400"
moved_by: trackchg-architect
working_by:
waiting_on:
revisit_when:
revisit_of:
revisits:
review_marks:
---
# Log every action, agentic and human

> [!todo] Your move · obsidian-track-changes · trackchg-architect
> You are looking at a decision from trackchg-architect. **Your move:** drag it to **yes, show me** to accept the recommendation (vault log) and see the design change as Track Changes suggestions first, or to **yes, just do it** to accept it and let trackchg-architect write it plainly and execute at once; or to **no**, **revise proposal**, **revise card**, **later**, **after POC**, **after MVP**, **talk**, or **snoozed**; or answer in chat. **Then:** trackchg-architect acts on your answer.

## The question

Keep one log per vault of every Track Changes action (accept, reject, resolve, reopen, reply, approve, remove comments, and every agent-tool write), each entry naming who (you, or the agent's seat and session), what, which note, and when, readable by the agent tool?

**Why:** today nothing records who did what to a note's marks. The marks carry an author, but an accept, a reject, a resolve, a reply or an approval leaves no trace of who did it and when, beyond git, which not every vault has; and an agent's edit of a property cannot be told from yours.

## Why this is being asked

**Start here.** You asked in chat on 2026-10-25 for "logging of every action, agentic and human". This card settles where that log lives and what it holds; it also absorbs the earlier card on signed property edits (build-queue item 11), which becomes one kind of entry in the same log. A yes starts the build in the plugin and the agent tool.

**Terms.**
- **Action**: anything that changes a note's marks or its approval: accept, reject, reply, comment, mark resolved, reopen, delete thread or message, remove highlight, Accept all / Reject all, Remove comments, Approve, Revoke; and every write the agent tool makes (suggest, revise, block, accept, resolve, acknowledge, comment, approve).
- **Agent tool**: `obsidian-track-changes-agent`, the command agents use; it already signs marks with a seat and session (card of 2026-10-23).
- **Plugin data**: files Obsidian lets a plugin keep under `.obsidian/plugins/track-changes/`, written through Obsidian's own API, not in your notes.
- **Trusted input**: a real click or key press in an Obsidian window; script code inside Obsidian cannot fake it, so the plugin can tell your click from an agent's call.

## Fields, laid out

- **One entry per action**, a line of JSON in a per-vault log:
  - *when* (ISO time with seconds), *note* (vault path), *action* (one of the names above), *mark* (its stable id and kind, when the action concerns one), *by* (your configured name, or the agent's seat and session), *via* (`panel`, `command`, `editor-menu`, or `agent-tool <version>`), *evidence* (`trusted-input` for your clicks, `none` otherwise), *property* and *old*/*new* for a property change.
- **Retention**: 90 days or 5,000 entries per vault, whichever keeps more; older entries dropped on load.
- **Reading it**: a new agent-tool command `log <note or vault> [--since ISO] [--by NAME] --json`, and a *Show activity log* command in Obsidian that opens it as a read-only view.

## Options and consequences

- **vault log** (recommended): one file per vault in plugin data, written by the plugin for your actions and by the agent tool for its own (same format, same file, both append under a lock). Nothing in your notes changes; the log travels with the vault's `.obsidian` folder if you sync it. Undo: switch logging off in settings; the file stays.
- **per-note frontmatter** (not viable): a `history:` list in each note's frontmatter. Everything in one place, but every card and design document would grow a history block that shows in Properties and in every diff.
- **git only** (fallback): rely on commits by path with the actor in the message. Free, but a vault need not be a repository, Obsidian's own saves are not commits, and it cannot tell your click from an agent's write.

## Design impact

- Plugin: every action handler appends an entry; the panel and commands pass `via`; a settings toggle (default on).
- Agent tool: every write verb appends an entry (seat and session from the environment, as the marks already carry); a `log` read verb.
- [[dev-docs/contracts/watchbill|Contract with watchbill]]: the log's format and the read verb become part of what watchbill may read; its earlier request (the property-edit log) is met by the `property` entries.

**Binds:** the architect; watchbill's architect (reader). · **Your part:** pick the option; nothing after a yes. · **Does not change:** the marks in your notes; the approval record; what any button does.

## Recommendation

**vault log.** It is the only option that records your clicks and agents' writes in one place without touching the notes, and the agent tool already has the state and locking it needs.

## History

- 2026-10-23: watchbill asked for a signed record of your property edits (card [[dev-docs/substantive/2026-10-23-confirm-signed-property-edits|Confirm: signed property edits]], still open); this card supersedes it.
- 2026-10-25, you in chat (verbatim): "There should be logging of every action, agentic and human"; then: "You are a watchbill architect. Use the card based system for decisions".

## Links

- [[dev-docs/substantive/2026-10-23-confirm-signed-property-edits|Confirm: signed property edits (superseded by this card)]]
- [[dev-docs/runs/2026-10-23-signed-property-edits/exchange|The exchange with watchbill on property edits]]
- [[dev-docs/build-queue|Build queue (item 11)]]

## The human's words

## Talk to the agent

- [Focus the agent that asked](http://link.localhost/herdr-jump#988b396b-f824-464e-83db-39e5a05961e0)
- [Focus its workspace](http://link.localhost/herdr-workspace#label=%F0%9F%93%A6%20s-app%20obsidian-track-changes)

## Card log

One line per edit: when, who (name, role, session), what. Written by the `watchbill decide` verbs and `watchbill decisions` sweeps; an agent that edits the card by hand adds its own line the same way.

- 2026-10-25T23:18:27-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · created the card [lane: agents drafting]
- 2026-10-25T23:22:08-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · filled in the card body by hand
- 2026-10-25T23:22:16-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · moved agents drafting → new decisions [lane: new decisions]

## John's comments

Type under the last *John* heading, or answer in chat; drag the card to **revise** when you want the agent to act on what you wrote.

### John
