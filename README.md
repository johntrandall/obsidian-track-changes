# Track Changes

Review [CriticMarkup](http://criticmarkup.com/) suggestions in an Obsidian side panel. Accept, reject, or reply — straight back into the markdown, no sidecar state.

![Track Changes panel showing multi-author comments from Claude and GPT](docs/screenshot.png)

Intended for AI-assisted review: the agent leaves `{++…++}`, `{--…--}`, `{~~old~>new~~}`, `{>>comment<<}`, `{==highlight==}` in your notes, you review them here. A sixth mark, `{=+…+=}`, flags AI-inserted text with a subtle rainbow highlight — visual only, no review card. You can leave the same marks yourself, via commands or the *Track changes* right-click submenu, so human edits sit alongside the AI's in one review.

![Each CriticMarkup form as raw syntax next to its rendering in Live Preview](docs/syntax_showcase.png)

## System

Shape: software project (watchbill; `watchbill systems` row `obsidian-track-changes`, doorbell architect, intake `intake/`). The plugin does the work in John's vaults; the architect is the only long-lived seat and is dormant `🌙` between cycles. Decisions: `dev-docs/decisions.md`. Build queue: `dev-docs/build-queue.md`. Watch: `dev-docs/watch.md`. Contracts: `dev-docs/contracts/`. Sibling system: `obsidian-track-changes-agent` (the CLI tool agents use), `~/dev/claude-plugin-obsidian-track-changes-agent`.

### Roster

| Seat | Agent name | Model | Effort | Start | Brief | Cwd |
|---|---|---|---|---|---|---|
| Playbook Architect | `trackchg-architect-ho2` | opus | high | fresh (read the records) | `dev-docs/runs/2026-10-29-handoff/briefs/architect.md` | `~/dev/obsidian-track-changes` |
| Crew per feature | builders, verifiers (sub-agents) | per brief | per brief | fresh | per item in `dev-docs/build-queue.md` | worktrees |

Steward: none (a software project). Scheduled fallback: none; nothing restarts a seat that dies until John or `watchbill restore` does.

### Pairs

| Date | Origin (name, session id) | Receiver (name, session id) | Scope | Historian exited |
|---|---|---|---|---|
| 2026-10-23 | founding session `obsidian-track-changes-df`, 8a6e4f5e-cd18-45bb-9f14-4fba643fefd0 | `trackchg-architect`, 988b396b-f824-464e-83db-39e5a05961e0 | session | no |

## Agent setup

Your agent needs to know the mark format. Two starting points:

- [`docs/SKILL.md`](https://github.com/philphilphil/obsidian-track-changes/blob/main/docs/SKILL.md) — a minimal reviewer skill you can hand to any agent.
- [claude-plugin-obsidian-track-changes-agent](https://github.com/johntrandall/claude-plugin-obsidian-track-changes-agent) — a Claude Code plugin by [@johntrandall](https://github.com/johntrandall). It signs every mark, attaches rationale comments, holds off while you're typing, and can watch a note to answer your comments live. Third-party; not maintained here.

## Features

- All five CriticMarkup forms with inline styling and a side-panel card per mark, plus `{=+…+=}` AI-added-text marks (rainbow, visual-only)
- Threaded comments (adjacent `{>>…<<}` blocks), multi-author colors
- Per-mark metadata — `author="…" date="…"` prefixes on any mark drive the author colors and dates
- Accept / reject per mark, reply inline, delete per message or thread
- Comment on a suggestion — the comment shows inside the suggestion's card; when the suggestion is accepted or rejected the thread stays in the note as the record, marked resolved
- **Human authoring** — insert or mark selections as any of the five CriticMarkup forms yourself, from the command palette or the *Track changes* right-click submenu, stamped with your name and date like a reply
- **Resolve without deleting** — mark a comment thread (or a lone highlight) resolved and it drops out of the panel, the counts and the overview into a folded *Resolved* section, while the comment stays in the note as `resolved="<date>"` on its root; reopen it at any time. An agent that has processed a thread marks it `acknowledged="<date>" acknowledged-by="<name>"` instead, shown as a badge on the card; the two flags are independent, and a reply from either side clears both
- **Accept all / Reject all** — two buttons in the review panel header (and commands) resolve every suggestion in the note at once, after a confirmation that names the count; comments and highlights stay, and a thread attached to a suggestion stays too, marked resolved
- **Accept or reject the changes in a selection** — select text in the editor and right-click: *Accept changes in selection* / *Reject changes in selection* act on every suggestion the selection touches (also commands)
- **Comments are the record** — accepting or rejecting a suggestion keeps the thread attached to it, marked resolved, so nothing is deleted and nothing asks for confirmation
- **Remove comments / Copy clean markdown** — a header button and command delete every comment thread in the note (after confirmation; suggestions stay), and *Copy clean markdown* puts a fully resolved, comment-free copy on the clipboard without touching the note
- **Finalize for publish** — resolves all remaining markup in one pass
- **Pending changes overview** — a vault-wide list of every note that still has suggestions, comments or highlights, most to review first, with per-file counts; click a row to open the note and its review panel. A note whose frontmatter says `review: whole` (set by a reviewing system such as watchbill; the plugin only reads it) is listed first: under *Needs review* when it has never been approved, under *Dirty: approved, changed since* when the frontmatter also carries `approved_at` (shown), then the notes with open marks. Each of those rows, and the review panel's header while the flag is set, offers **Approve**: it records your approval of that version in the note's frontmatter (`status: accepted`, who, when, `approved_hash` of the text as approved, `approved_sha: pending` until a commit holds it), refusing while suggestions or unresolved comments are still open (resolved comments stay in the note and never block). Once a note is approved, the review panel's header keeps showing it: approved when and by whom and unchanged since, *unchanged, N open since* when suggestions or comments were added after the approval but the approved text is intact, or *Changed since approval* once the text differs. The agent tool's `drift` then tells any system whether the note is clean, has suggestions open, or changed since you approved it. A status-bar item shows the vault-wide total (hidden when there is nothing to review) and opens the overview
- **Accept and Reject stay put** — on every suggestion card the two decision buttons sit in a fixed slot at the right edge, with Comment to their left, so they never shift between cards
- **Every button says what it does** — hover any button in the review panel or the overview for one or two sentences on what the click does, what stays, and what it does not do (Accept all never approves the note)
- **Review from the keyboard** — accept, reject, resolve, reopen, remove a highlight or delete a comment at the cursor (bind hotkeys), or every suggestion in a selection; see Commands
- **Works on iPad and iPhone** — the panel, the overview and the commands run on Obsidian mobile (tested in WebKit, the iPad's engine, and under Obsidian's mobile emulation; a short checklist covers what only a real iPad shows, see Testing on iPad)
- Reading mode: accepted preview or raw side-by-side
- Settings: your name (stamped on your replies and marks; unattributed marks show it), reply date style (date or date and time), where the review panel opens (right sidebar or a split beside the note), the status-bar count on or off, and custom colors and tint intensity for additions, deletions, highlights, comments and AI-added text
- Code blocks left alone

## Interaction

- **Click a mark** in Live Preview to edit in place — the raw markup is exposed, the color stays.
- **⌘/Ctrl-click a mark** (or set *Click highlighted text to open in panel*) opens the side panel instead.
- **Click a panel card** to jump the editor to its chip.
- **Source Mode** shows raw markup verbatim.

## Testing by eye in a VM

Reviewing the panel means clicking in Obsidian, and the plugin should never be checked in a vault you care about. The project has a throwaway Obsidian in a local Tart VM for that (macOS guest, cloned from the `macos-15.7-l2-dev` golden image; see the `tart-vm-management` skill for the image and the wrapper):

```sh
scripts/vm-test.sh up        # first time: clone + boot, install Obsidian, make the test vault, link the dev build, open it
npm run build && scripts/vm-test.sh reload   # after a code change
scripts/vm-test.sh fixture   # reset test/fixtures/vm-fixture.md in the vault (one of everything the panel renders)
scripts/vm-test.sh shot      # screenshot the VM screen to /tmp/obsidian-vm.png
scripts/vm-test.sh eval "app.workspace.getLeavesOfType('tc-review-panel').length"   # JS in the vault window
scripts/vm-test.sh mobile on # switch the vault window to Obsidian's mobile emulation (`off` switches back)
scripts/vm-test.sh smoke-mobile   # the review-panel smoke test under mobile emulation, screenshots per step
scripts/vm-test.sh vnc       # watch it in Screen Sharing (admin / admin)
scripts/vm-test.sh stop      # keep the disk; `destroy` deletes the VM
```

The repository is shared into the VM over VirtioFS, so the test vault's `.obsidian/plugins/track-changes` is a symlink to this checkout: build on the host, `reload` in the guest. The vault (`/Users/admin/tc-test-vault`) exists only in the VM, with the reviewer name `Test Reviewer`. On the very first `up`, Obsidian opens no vault window: open the folder as a vault once through Screen Sharing (`vnc`; menu *File → Open Vault… → Open folder as vault*), and turn on *Settings → General → Advanced → Command line interface*, which `eval` and everything built on it need; then run `up` again. The VM name is `obsidian-track-changes-dev` (override with `VM=`).

`mobile on` calls `app.emulateMobile(true)` in the vault window: Obsidian reloads with its phone/tablet layout and `Platform.isMobile` set, the closest thing to the iPad that can be driven from a script. `smoke-mobile` resets the fixture, turns emulation on and runs `scripts/vm-mobile-smoke.js` inside the window at 1024×768 and 834×1194 (iPad landscape and portrait): it reloads the plugin and checks it loads cleanly with no status-bar count, opens the review panel and the pending overview by command id, checks the editor-menu items, runs the cursor commands with the cursor placed through the editor API, presses *Accept all*, *Remove comments* and *Approve* with their confirmations, and after each step compares the panel (counts, *Resolved* fold, badges, buttons) and the note's text with `test/fixtures/vm-mobile-smoke.json`. Results and a screenshot per step land in `dev-docs/runs/<date>-mobile/`; the command exits non-zero on any failure. The expectations in that JSON are themselves checked against the plugin's pure modules by `test/vm-smoke-plan.test.mjs` (part of `npm test`).

## Testing on iPad

Obsidian for iOS cannot run in the iOS Simulator, so the iPad is covered in three layers: `npm run test:webkit` runs the unit tests in Playwright's WebKit (the iPad's JavaScript engine; install the engine once with `npx playwright install webkit`), `scripts/vm-test.sh smoke-mobile` drives the panel under desktop mobile emulation, and a ten-minute checklist covers what only the device shows (touch, the iOS selection menu, sidebars as drawers): [`dev-docs/testing/ipad-checklist.md`](dev-docs/testing/ipad-checklist.md).

## Commands

- *Open review panel*
- *Open pending changes overview* — the vault-wide list (also the list-checks ribbon icon and the status-bar count)
- *Rescan vault for pending changes* — the overview keeps itself current from vault events; this forces a full re-read
- *Finalize for publish* — accept additions, drop deletions and comments, etc.
- *Insert addition*, *Mark selection as deletion*, *Mark selection for substitution*, *Highlight selection*, *Insert comment* — also under *Track changes* in the editor's right-click menu
- *Accept change at cursor*, *Reject change at cursor*, *Remove highlight at cursor*, *Delete comment at cursor*, *Mark comment thread or highlight at cursor resolved*, *Reopen comment thread or highlight at cursor* — act on the mark the cursor is in; bind hotkeys for fast review. Also under *Track changes* in the right-click menu when the cursor is on a matching mark
- *Accept changes in selection*, *Reject changes in selection* — every suggestion the selection touches; also in the right-click menu whenever the selection contains one
- *Accept all changes in note*, *Reject all changes in note* — the panel header's buttons as commands; always ask first

## Install

**Community Plugins** → search "Track Changes" ([community.obsidian.md](https://community.obsidian.md/plugins/track-changes)).

Manual: drop `main.js`, `manifest.json`, `styles.css` into `<vault>/.obsidian/plugins/track-changes/`.

## Build

```sh
npm install && npm run build
```

## License

MIT.
