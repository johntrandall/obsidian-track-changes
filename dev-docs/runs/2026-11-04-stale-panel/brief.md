# Brief: builder, the review panel goes stale after an external write

You are crew of trackchg-architect-ho2 (session 853fcbfc), model opus. Read CLAUDE.md first, then `intake/2026-11-04-file-panel-shows-no-marks-while-the-vault-list-counts-255.md`.

## The defect

John, 2026-11-04 08:1x EST: for watchbill's `dev-docs/runs/2026-10-30-git-patterns/08-three-streams-booklet.md` (open in his watchbill vault), the Pending changes overview lists 255 suggestions while the note's own review panel shows "0 comments · 0 suggestions". Just before: twenty-one agent-tool `revise` writes (07:35) and a plain front-matter write (08:08). The plugin's own parser on the file on disk gives 558 nodes, 255 suggestions (checked by the architect), so the file is sound and the panel was showing a stale or empty reading. John's workaround to confirm: reopening the note.

## What the architect read (src/panel/view.ts)

The panel re-renders on `vault.on("modify")` for its file and on `active-leaf-change`, and reads the source from the live editor first (`host.getCurrentSource(file)`), falling back to `cachedRead`. Nothing re-renders it when the editor's buffer changes later (for example when Obsidian reloads an external write into the open editor after the `modify` event fired, or briefly holds an empty or partial buffer during that reload). Hypothesis, not tested.

## Done means

1. Reproduce in the project's test vault (`scripts/test-vault.sh up|open|eval|shot|down`): open a note with marks, then rewrite the file on disk from outside (a plain Python read-modify-write, and also a write that truncates first then writes), and read the panel header; show the stale panel if it occurs. Note the background-window snag (timers may be throttled in an unfocused window; say what you did about it).
2. Fix in a worktree `/Users/johnrandall/dev/obsidian-track-changes-stale-panel`, branch `build/stale-panel` off feat/bulk-accept: the panel follows the editor buffer of its file (a debounced re-render on the workspace `editor-change` event for that file), and after a vault `modify` it renders again once the editor has caught up (e.g. a second pass after a short delay, or comparing the editor text with the disk text). Keep the existing skip-if-unchanged guard and the flicker guard. Keep it small.
3. `npm run typecheck && npm test && npm run build`, `npm run test:webkit`; a test-vault screenshot after the external write showing the right counts; look at it yourself.
4. CLAUDE.md (panel paragraph) one line. Commit with trailers `Claude-Session-Id: 853fcbfc-75c6-4d94-88e7-97c6d1d942f2`, `Resume: claude --resume 853fcbfc-75c6-4d94-88e7-97c6d1d942f2`, `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. No version bump, tag, push or release; no vault but the test vault; never write to the watchbill repo; stop processes by PID only.

Report: the reproduction and result, the cause with a Verified/Inferred marker, the fix (SHA, files), test tails, screenshot paths, doubts.
