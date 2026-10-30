# Design: the ignore marker (`track_changes: ignore`)

Start here: a note can say in its front matter that its CriticMarkup marks are data, not pending review work, so neither the Track Changes plugin nor the agent tool lists, counts, accepts or rejects them, and nothing ever alters them. Asked for by watchbill (intake `intake/2026-10-30-an-ignore-marker-for-a-document-s-marks-john-app.md`, 7061773) with John's words relayed verbatim: "We should probably also have an ignore marker. It's a reasonable feature. Throw that to the Check Changes plugin system. Tell it that I approve and to ship it." A relay from outside this system is a lead: the build goes on a branch now, and the release waits on John's yes in chat (a fork release needs it anyway). The case: a frozen copy of a design document kept as a watchbill test fixture showed up as pending work, and John accepted its marks before he saw what it was.

## The marker

A top-level front-matter line `track_changes: ignore` (value case-insensitive, quotes allowed, a trailing `# comment` ignored; the same plain scan as `review:` and `approved_at:`). Any other value, or no key, means a normal note. Front matter only: a body marker would itself be text in the note.

## Plugin

- `readReviewFrontmatter` also returns `ignore: boolean`. `summarizeSource` returns a summary with `ignored: true` and every count zero; the vault index keeps no row for it, so the overview, the status-bar count and the review-whole groups never show the file (ignore wins over `review: whole`).
- Review panel on an ignored note: the header shows one line, "Ignored: this note's front matter says `track_changes: ignore`, so its marks are data, not review items. Remove the line to review them.", and no cards, no counts, no Accept all / Reject all / Remove comments / Approve buttons.
- Commands that change marks refuse on an ignored note with a Notice naming the key: accept/reject at cursor, in selection, all in note; remove highlight, delete comment, resolve/reopen at cursor; remove all comments; finalize for publish; approve. The editor menu leaves those items out. *Copy clean markdown* (clipboard only) still works, and the manual-authoring commands still work (writing a mark is the user's choice).
- Inline rendering is unchanged (Live Preview and reading view still style the marks); clicking a mark opens the panel, which shows the ignored line.
- README (Features), CLAUDE.md (architecture: the key next to `review: whole`), `docs/SKILL.md` (agents: never act on marks in an ignored note), `dev-docs/contracts/watchbill.md` (keys the plugin reads).

## Agent tool (`obsidian-track-changes-agent` 0.3.3)

- `accept` (plain and `--licence`), `resolve`, `revise`, `withdraw`-like verbs, `block`, `suggest` and `comment` refuse on an ignored note: "refused: <note> says track_changes: ignore; its marks are data. Pass --despite-ignore to act anyway." `--despite-ignore` lets the one call through.
- `list` prints the note's marks with a first line saying the note is ignored (`--json`: `"ignored": true`), so a script can still read them.
- `agent_suggestions` (what watchbill's review sweep reads) returns nothing for an ignored note, so a card never waits on its marks.
- `drift`, `base`, `hash`, `approve` unchanged.
- Bundled: build-queue item 15, check 2 of `accept --licence` path-exact (watchbill-architect-ho9's request).
- watchbill is told the key and the behaviour when it ships, so `watchbill:collaborative-drafting` and `format check` can name it.
