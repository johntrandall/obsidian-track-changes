# Brief: plugin builder, the ignore marker

You are crew of trackchg-architect-ho2 (session 853fcbfc), model opus. Build the plugin half of `dev-docs/runs/2026-10-30-ignore-marker/design.md` (read it first, then CLAUDE.md) in the worktree `/Users/johnrandall/dev/obsidian-track-changes-ignore`, branch `build/ignore-marker` (off feat/bulk-accept). Work and commit only there; never in `/Users/johnrandall/dev/obsidian-track-changes` (the primary checkout).

Done means:
1. `track_changes: ignore` read by `readReviewFrontmatter`; `summarizeSource` returns `ignored: true` with zero counts; the vault index keeps no row; overview and status bar never show the file, even with `review: whole`.
2. Review panel shows the one ignored line (wording in the design) and no cards, counts or header buttons.
3. Every mark-changing command and editor-menu item listed in the design refuses with a Notice (menu: item left out); Copy clean markdown and the five authoring commands still work. Put the check in one helper so no path misses it.
4. Tests in `test/` (plain Node `.mjs`, follow an existing one): frontmatter parsing (case, quotes, comment, other values), summarizeSource, and whatever pure guard you add. `npm run typecheck && npm test && npm run build` green; `npm run test:webkit` green if WebKit is installed (say if it is not).
5. Docs in the same branch: README Features (one bullet), CLAUDE.md (next to `review: whole`), `docs/SKILL.md` (agents never act on marks in an ignored note), `dev-docs/contracts/watchbill.md` (keys the plugin reads). One line per paragraph, no hard wraps, Oxford commas.
6. Every new button or menu item carries a rollover (`aria-label`): you add none, most likely; if you do, it needs one.
7. Commit with a message ending in the trailers `Claude-Session-Id: 853fcbfc-75c6-4d94-88e7-97c6d1d942f2`, `Resume: claude --resume 853fcbfc-75c6-4d94-88e7-97c6d1d942f2`, `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Do not bump the version, tag, release, push, or touch any vault or VM.

Report: the commit SHA, the files changed, test output tails, and anything in the design you changed or doubt.
