# Brief: investigator, truncated substitutions after a panel decision

You are crew of trackchg-architect-ho2 (session 853fcbfc), model opus. Find the cause, fix it in the plugin if it is ours, and prove it. Read CLAUDE.md first (data flow: parse → edits → rebase → apply; `applyEditsToFile` prefers the live CM6 `EditorView.dispatch`, then `Editor.setValue`, then `Vault.process`).

## The defect (reported by watchbill's git-patterns session, 2026-11-03)

On `dev-docs/runs/2026-10-30-git-patterns/08-three-streams-booklet.md` in `~/dev/claude-plugin-watchbill` (watchbill vault), between about 09:10 and 09:30 EST John rejected or resolved, in the Track Changes panel (jtr.10), eleven substitutions, each with an attached comment thread. Every one was left damaged:
- after a reject: `{author="Claude (editor)" date="2026-11-03"~~OLD{author=…>>comment<<}…` (the `~>NEW~~}` tail gone, the prefix and the `~~` opener kept, no `resolved=` added to the comment);
- after an accept ("resolved"): `{author=…~~OLD~>NEW{author=…>>comment<<}` (only `~~}` gone).
Intact bytes: `git show efcae149:<that path>` (lines 379, 381, 383 …); damaged: `git show 9edb42f8:<path>` and `ca84c89e^`. Watchbill's design seat was editing the same note at the same time (commits efcae149 08:17:09, 9edb42f8 08:17:47 -0500 rewrote every gate into bullets), with `obsidian-track-changes-agent` and possibly plain writes.

## What is already known (trackchg-architect-ho2)

- With no concurrent writer, a panel Reject on the BG1 card in the test vault does the right thing in the editor buffer: heading plain, comment kept with `resolved=`. The plugin emits one whole-mark edit with `expected` = the raw mark, plus a prefix edit on the thread root; rebase cannot half-apply a whole-mark edit.
- Hypothesis (Inferred, not tested): Obsidian's own "modified externally, merging changes automatically" (a diff/patch merge of disk changes into a dirty editor buffer) applied some hunks of the plugin's change and dropped others while an agent wrote the file. The damage shape (the opener hunk dropped, the closer hunk kept, the flag insertion dropped) fits independent patch hunks, some failing.
- Test-harness snag: in the test vault window (not focused) the editor never auto-saved the plugin's edits to disk, even after `view.save()`, and the buffer showed one line fewer than the disk file: check what the editor actually holds before trusting a result. A background Electron window may throttle timers; you may need to focus the test window's webContents or call the save path directly.

## Done means

1. A reproduction in the project's test vault (`scripts/test-vault.sh up|open|eval|shot|down`; the note: `test/vault/` fixture from the efcae149 lines, as `*.md.fixture`) that produces the damaged shape, with the exact sequence (panel decision, external write, timings). If you cannot reproduce it, say what you tried and stop.
2. The cause, marked Verified (changed one thing, saw the effect) or not.
3. If the cause is ours or we can defend against it, a fix in a worktree `/Users/johnrandall/dev/obsidian-track-changes-truncated` on branch `build/truncated-marks` off feat/bulk-accept. Candidate defences: apply the decision through `Vault.process` (atomic read-modify-write on disk) when the file changed on disk since the editor loaded it; or save before and verify after (re-read, re-parse, and if the mark is half-gone, restore and show a Notice). Prefer the smallest change that makes a half-applied decision impossible or at least detected and reported. Tests (plain Node `.mjs`), `npm run typecheck && npm test && npm run build`, `npm run test:webkit`; a test-vault screenshot of the repaired behaviour.
4. Commit with trailers `Claude-Session-Id: 853fcbfc-75c6-4d94-88e7-97c6d1d942f2`, `Resume: claude --resume 853fcbfc-75c6-4d94-88e7-97c6d1d942f2`, `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. No version bump, tag, push or release; no vault but the test vault; never touch the watchbill repo (read only with git show); stop processes by PID only.

Report: the reproduction steps and result, the cause with its confidence marker, the fix (SHA, files), test tails, screenshot paths, and doubts.
