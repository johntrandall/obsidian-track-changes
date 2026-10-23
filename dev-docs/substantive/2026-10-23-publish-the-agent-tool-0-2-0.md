---
_human_verdict: agent waiting
title: Publish the agent tool 0.2.0
type: decision
kind: decision
weight: quick
system: obsidian-track-changes
question: "Publish the agent tool's 0.1.12 and 0.2.0 changes to the public repository as one release, 0.2.0, and refresh the marketplace so every session gets it?"
options: []
recommendation: "yes"
unblocks: "build-queue item 3; watchbill's use of drift in other sessions (the marketplace copy is 0.1.11)"
asked_by: trackchg-architect
asked_at: "2026-10-23T12:11:58-0400"
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
human_words: "Come on, Adam. Yes, I approve the publication. We don't want tail scale in the golden Vienna image. That should be one step down, so... so, whatever, we do, it needs to be part of the BM inheritage chain, the tail scale should be a separate step. Does the ends might be doing dangerous things, and they might, be throwaway? We might want to use BM as an isolated environment, so we don't want it to be network connected by default. Yeah, that's one step beyond the Golden DM. What's our current hierarchy of the Amsterdam? Something like bass to golden to tail scale. What's the inheritage chain there? Can you print me a one cheater that shows the inheritance chain after we finalize it in this chat?"
snooze_until:
previous_verdict: "yes"
moved_at: "2026-10-23T13:57:14-0400"
moved_by: trackchg-architect
working_by:
waiting_on: "John: card Session id already in the agent tool's public history"
revisit_when:
revisit_of:
revisits:
review_marks:
---
# Publish the agent tool 0.2.0

> [!todo] Your move · obsidian-track-changes · trackchg-architect
> Nothing for you: waiting on John: card Session id already in the agent tool's public history.

## The question

Publish the agent tool's 0.1.12 and 0.2.0 changes to the public repository as one release, 0.2.0, and refresh the marketplace so every session gets it?

**Why:** every Claude session that loads the agent tool from the marketplace still gets 0.1.11, which lacks the approval and drift commands watchbill now calls, and lets an agent comment inside a thread you marked resolved.

## Why this is being asked

**Start here.** The agent tool is the command-line program and Claude Code plugin agents use to write signed Track Changes suggestions and comments into your notes. Its public copy on GitHub is 0.1.11. Two later versions are built and tested but private. Making them public is a new public publication under your GitHub account, so it needs your word for each release (the founding session treated it that way after 0.1.11). Asked on 2026-10-20 and 2026-10-22 in chat; no answer yet.

**Terms.**
- **Agent tool**: `obsidian-track-changes-agent`, private source `~/dev/claude-plugin-obsidian-track-changes-agent` (on the umbridge git server only).
- **Public repository**: [github.com/johntrandall/claude-plugin-obsidian-track-changes-agent](https://github.com/johntrandall/claude-plugin-obsidian-track-changes-agent), one squashed commit per release, no private history.
- **Marketplace**: `johntrandall-plugins` (repository johntrandall/claude-plugins), which points at the public repository; sessions install the plugin from it.
- **0.1.12**: `resolve` refuses to write into a thread whose root carries your `resolved=` flag; a new comment there is still allowed and reopens it.
- **0.2.0**: document approval: `base`, `hash`, `drift` (tells whether a note is clean, has suggestions open, changed since you approved it, or needs review) and `approve`, which the panel's Approve button and watchbill use.
- **Personal-value scan**: `release/scan.sh`, which refuses the export if it finds your name, host names, absolute paths, session ids or 1Password references.

## Design impact

- Public repository: today 0.1.11. After: 0.2.0 (one commit, scanned).
- Marketplace sessions: today 0.1.11. After `claude plugin marketplace update` and a restart, 0.2.0; on this Mac `~/.local/bin` already runs the working tree, so nothing changes here.
- watchbill's `status` / `drift` wiring (0.10.52) works in any session, not only on this Mac.

**Binds:** the architect (runs the export). · **Your part:** nothing after a yes. · **Does not change:** the private repository, its history and its `dev-docs/`, which never leave umbridge; the Obsidian plugin fork.

## Options and consequences

- **yes** (recommended): the architect runs `release/export.sh`, the clean-install test and the scan on the whole public clone, pushes one commit "obsidian-track-changes-agent 0.2.0", updates the marketplace and tells watchbill. Undo: push 0.1.11's tree back as a new commit (the public history keeps both).
- **no** (viable): public sessions stay on 0.1.11; on this Mac everything already works. Undo: none needed.

## Recommendation

**yes.** Both versions are built, tested against shared fixtures, and pass the scan wording fixes; skipping 0.1.12 as a separate public release keeps the public history to one commit per release you approved.

## History

- 2026-10-20, chat in the founding session's tab: "push to the public repos" (verbatim, relayed by obsidian-track-changes-df); that covered 0.1.11, pushed that day.
- 2026-10-20 the founding session asked "Say the word and I push it public and refresh the marketplace, as with 0.1.11" for 0.1.12; 2026-10-22 asked again for 0.1.12 and 0.2.0. No answer.

## Links

- [Public repository](https://github.com/johntrandall/claude-plugin-obsidian-track-changes-agent)
- [Release procedure (release/README.md)](file:///Users/johnrandall/dev/claude-plugin-obsidian-track-changes-agent/release/README.md)
- [Approval anchor and drift design](file:///Users/johnrandall/dev/claude-plugin-obsidian-track-changes-agent/dev-docs/design/approval-anchor-and-drift.md)
- [[dev-docs/contracts/watchbill|Contract with watchbill]]
- [[dev-docs/build-queue|Build queue (item 3)]]

## The human's words

> Come on, Adam. Yes, I approve the publication. We don't want tail scale in the golden Vienna image. That should be one step down, so... so, whatever, we do, it needs to be part of the BM inheritage chain, the tail scale should be a separate step. Does the ends might be doing dangerous things, and they might, be throwaway? We might want to use BM as an isolated environment, so we don't want it to be network connected by default. Yeah, that's one step beyond the Golden DM. What's our current hierarchy of the Amsterdam? Something like bass to golden to tail scale. What's the inheritage chain there? Can you print me a one cheater that shows the inheritance chain after we finalize it in this chat?

(in chat, 2026-10-23T13:40:32-0400, recorded by 988b396b-f824-464e-83db-39e5a05961e0)

## Talk to the agent

- [Focus the agent that asked](http://link.localhost/herdr-jump#988b396b-f824-464e-83db-39e5a05961e0)
- [Focus its workspace](http://link.localhost/herdr-workspace#label=%F0%9F%93%A6%20s-app%20obsidian-track-changes)

## Card log

One line per edit: when, who (name, role, session), what. Written by the `watchbill decide` verbs and `watchbill decisions` sweeps; an agent that edits the card by hand adds its own line the same way.

- 2026-10-23T12:11:58-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · created the card [lane: agent drafting]
- 2026-10-23T12:12:48-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · filled in the card body by hand
- 2026-10-23T12:12:55-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · moved agent drafting → new [lane: new]
- 2026-10-23T13:40:32-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · recorded the human's chat answer: yes [lane: yes]
- 2026-10-23T13:48:21-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · moved yes → agent working (by trackchg-architect) [lane: agent working]
- 2026-10-23T13:57:14-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · moved agent working → agent waiting (waiting on John: card Session id already in the agent tool's public history) [lane: agent waiting]

## John's comments

Type under the last *John* heading, or answer in chat; drag the card to **revise** when you want the agent to act on what you wrote.

### John
