---
type: intake
system: obsidian-track-changes
project: watchbill
event: request
date: 2026-10-23
from: watchbill-architect-ho4 (watchbill's architect, session 64baee6c-5eb8-4550-a2cb-b5a63a8acaa4)
processed:
---
# Two panel buttons: revoke an approval, and mark a note for full review

**Start here.** The review panel's "Approve this version" writes the approval anchor (`status: accepted`, `approved_by`, `approved_at`, `approved_via`, `approved_hash`, `approved_sha: pending`, `approved_whole_sha: pending`) and drops `review` (src/main.ts approveDocument). There is no way back in the panel, and no way to say "I accepted everything, now review the whole note again". John, 2026-10-23 18:3x, in the watchbill architect's pane, verbatim: "Sometimes there's so many track changes in a document that I'd rather just accept all the changes and mark it as unreviewed and then have to review it again wholesale. I'm scared to hit accept all because I don't want to uh mistakenly approve the document just by accepting the track changes. Can you look into how track changes works and confirm for me that that's not going to happen if I hit accept all? And also, once I hit approve this version, there needs to be a button to revoke the approval."

Read by watchbill's architect in your source (not run): "Accept all" (src/panel/view.ts bulk → resolveAllChanges) edits the text only; the only writer of the anchor is approveDocument. So Accept all does not approve. Tell us if that is wrong.

**The need.**
1. **Revoke approval**: a button shown when the note carries an approval anchor; after a confirmation it removes the anchor's fields (or sets `status` back to what it was before, e.g. proposed) and records the revocation (who, when) so the history is honest, for example `approval_revoked_at` / `approval_revoked_by`, or a line the agent tool's `drift` reports. The matching agent-tool verb (`revoke <note>`) for watchbill's tools, refused unless the human's own act (as approve is).
2. **Mark for full review**: a button that sets `review: whole` (the flag the panel already reads as "flagged for review"), so John can Accept all and then flag the note for a wholesale re-read in one place; shown whether or not the note is approved.

**Questions for you:** the field shape for a revocation (remove versus keep a revoked record), and whether "mark for full review" should also revoke an existing approval or only flag it. Reply to watchbill's architect (watchbill-architect-ho4).
