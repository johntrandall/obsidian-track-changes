---
_human_verdict: new decisions
title: Release Track Changes 2.3.0-jtr.9
type: decision
kind: decision
weight: quick
asks:
system: obsidian-track-changes
question: "Release the fork as 2.3.0-jtr.9 (the review panel's comment count fix) on GitHub and install it in every open vault, as with jtr.4 to jtr.8?"
options: []
recommendation: "yes"
unblocks: mobile harness cycle gate, criterion 5 (release and rollout)
asked_by: trackchg-architect
asked_at: "2026-10-23T12:38:39-0400"
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
# Release Track Changes 2.3.0-jtr.9

> [!todo] Your move · obsidian-track-changes · trackchg-architect
> You are looking at a decision from trackchg-architect. **Your move:** drag it to **yes, show me** to accept the recommendation (yes) and see the design change as Track Changes suggestions first, or to **yes, just do it** to accept it and let trackchg-architect write it plainly and execute at once; or to **no**, **revise proposal**, **revise card**, **later**, **after POC**, **after MVP**, **talk**, or **snoozed**; or answer in chat. **Then:** trackchg-architect acts on your answer.

> [!success] What changed · revision 3 · 2026-10-23 15:54 · trackchg-architect
> - New: jtr.9 also carries the approval indicator in the review panel header (landed 89ca53c, verified).

## The question

Release the fork as 2.3.0-jtr.9 (the review panel's comment count fix) on GitHub and install it in every open vault, as with jtr.4 to jtr.8?

**Why:** since jtr.6 the review panel's header has counted one comment too few for every highlight you marked resolved (it could show "-1 comments"), so the panel and the pending overview disagree. The fix is built and tested; it reaches your vaults only as a release.

## Why this is being asked

**Start here.** Every fork build so far (jtr.4 to jtr.8) was released to the fork's GitHub releases and installed into your open vaults by the agent, under your words of 2026-10-20. This time Claude Code's permission check refused it: tagging and pushing the release was judged a production deploy needing your explicit say. So the release waits on you. Everything up to the tag is done.

**Terms.**
- **jtr.N**: your fork's builds, `2.3.0-jtr.N`, published as GitHub releases of [johntrandall/obsidian-track-changes](https://github.com/johntrandall/obsidian-track-changes/releases) (assets `main.js`, `manifest.json`, `styles.css`).
- **`deployed`**: the branch releases are cut from. The merge of `feat/bulk-accept` into it is committed (b0f5220); the version bump to jtr.9 is written but not committed.
- **BRAT**: the Obsidian plugin that installs a plugin from a GitHub release; the rollout uses it inside each open vault, switches it off afterwards, raises no window while your screen is locked, and never opens a closed vault.
- **Open vault**: a vault with a window open in Obsidian now.

## Design impact

- Your open vaults: today run jtr.8. After: jtr.9; the only change you would notice is the header's comment count (matches the overview; a resolved highlight never lowers it).
- The fork's GitHub releases: a new latest release 2.3.0-jtr.9 with the notes "Fixed: the review panel's comment count no longer drops when you resolve a highlight; it matches the pending overview." and "Fixed: Approve this version no longer refuses a note whose only remaining comments are resolved; resolved comments stay in the note." ==and "Added: the review panel shows when an approved note was approved and by whom, and whether it has changed since."==

**Binds:** the architect (commits the bump, tags, pushes `deployed` and the tag, creates the release, rolls it out). · **Your part:** say yes here or in chat; if the permission check still refuses, the architect gives you the three commands to run or the one permission rule to add. · **Does not change:** anything else in the plugin; the mobile harness is test tooling and does not ship.

## Options and consequences

- **yes** (recommended): released and installed within about 15 minutes; a version check of every open vault goes in the gate. Undo: install jtr.8 again the same way.
- **no** (viable): the fix stays on `feat/bulk-accept` and ships with the next release; the miscount stays in your vaults until then.

## Recommendation

**yes.** A one-function fix with a regression test, checked cold by a verifier (14 inputs: the old count was wrong on 5, the new one on none), and the same release route as the last five builds.

## History

- 2026-10-20, chat in the founding session's tab (verbatim, relayed by obsidian-track-changes-df): "deploy this locally"; "make sure the obsidian track changes is installed into all Obsidian vaults that have been touched in the last 90 days"; "close them as you go, or we will get ram-exhausted". jtr.4 to jtr.8 were released under these.
- 2026-10-23 12:29–12:38 EDT: the bug was found by the mobile harness's smoke plan, fixed (38a8720), landed (93f0c41); the push and then the local tag were refused by the permission check ("Production Deploy").

## Links

- [[dev-docs/runs/2026-10-23-mobile-harness/verifier-1|Verifier report (check 3: the count fix)]]
- [[dev-docs/runs/2026-10-23-mobile-harness/briefs/cycle|Cycle brief (criterion 5)]]
- [Fork releases on GitHub](https://github.com/johntrandall/obsidian-track-changes/releases)

## The human's words

## Talk to the agent

- [Focus the agent that asked](http://link.localhost/herdr-jump#988b396b-f824-464e-83db-39e5a05961e0)
- [Focus its workspace](http://link.localhost/herdr-workspace#label=%F0%9F%93%A6%20s-app%20obsidian-track-changes)

## Card log

One line per edit: when, who (name, role, session), what. Written by the `watchbill decide` verbs and `watchbill decisions` sweeps; an agent that edits the card by hand adds its own line the same way.

- 2026-10-23T12:38:39-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · created the card [lane: agent drafting]
- 2026-10-23T12:39:01-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · filled in the card body by hand
- 2026-10-23T12:39:02-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · moved agent drafting → new [lane: new]
- 2026-10-23T15:02:16-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · revision 2: the Approve fix rides in jtr.9
- 2026-10-23T15:54:46-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · revision 3: the approval indicator rides in jtr.9
- 2026-10-23T21:11:32-0400 · watchbill systems init --refresh-bases (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · lane new → new decisions by the 0.10.50 refresh (new is now new decisions); earlier mover trackchg-architect at 2026-10-23T12:39:02-0400 [lane: new decisions]
- 2026-10-25T10:52:46-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · rewrote the Your move callout to the current wording (watchbill decisions your-move, 0.10.69)
- 2026-10-25T23:24:03-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · replied: jtr.9 now also carries a rollover on every button in the review panel and the overview (your instruction of 2026-10-25;… (held in agent editing from new decisions, back to new decisions)

## John's comments

Type under the last *John* heading, or answer in chat; drag the card to **revise** when you want the agent to act on what you wrote.

### trackchg-architect · 2026-10-25 23:24

jtr.9 now also carries a rollover on every button in the review panel and the overview (your instruction of 2026-10-25; landed 5398bd5, [[dev-docs/substantive/2026-10-25-rollover-help-on-every-button|its card]]). Four changes ride in this release: the comment-count fix, Approve with resolved comments, the approval indicator, and the rollovers.

### John
