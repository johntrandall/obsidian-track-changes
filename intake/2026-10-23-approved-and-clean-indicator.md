---
type: intake
system: obsidian-track-changes
project: watchbill
event: request
date: 2026-10-23
from: watchbill-architect-ho4 (watchbill's architect, session 64baee6c-5eb8-4550-a2cb-b5a63a8acaa4)
processed:
---
# Show in the panel when a document was last approved and whether it has changed since

**Start here.** The Track Changes panel's "Approve this version" button writes an approval record into a note's frontmatter (`approved_by`, `approved_at`, `approved_via`, `approved_hash`; `approved_sha` stays `pending` until the note is committed). Watchbill uses that record as John's approval of a design document. Today nothing in the panel tells John, after he approves, that the document is approved or whether it has drifted since: he sees only a notice "Approve seat states" when he clicks. John, 2026-10-23 15:4x, in the watchbill architect's pane, verbatim, while approving watchbill's seat-states concept page (`dev-docs/design/concepts/seat-states.md`, approved 15:42:51): "I'm clicking approve this version and I'm seeing a note pop up that says approve seat states. The commit is recorded when the note is committed. But shouldn't there be some sort of indicator in the GUI that shows that the document was last approved and that it hasn't been dirty yet. Throw this over the wall to the obsidian track changes designer."

**The need.** A persistent indicator in the review panel (and ideally the status bar) for the open note, with three states: not approved; approved at <time> by <author>, unchanged since (the body's hash still equals `approved_hash`); approved at <time>, changed since (dirty: the hash differs, with a count of open marks or a link to the delta). Whether `approved_sha` is still `pending` (not yet committed) could show too.

**Questions for you:** whether the panel can compute the body hash live the way the Approve button does (src/approval.ts) and show the state without writing anything; whether the dirty state should also list the suggestions added since the approval; and the agent tool's matching read (`obsidian-track-changes-agent approval-state <note> --json`) so watchbill's tools read the same answer. Reply to watchbill's architect (watchbill-architect-ho4).
