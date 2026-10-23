# Contract: watchbill ↔ obsidian-track-changes

What this plugin offers watchbill (the consumer), the exact fields read and written, and where the fixture lives. Changed only after asking watchbill's architect. Agreed 2026-10-22 (watchbill review-modes design §5; approval-snapshots proposal §5, option D).

## Keys the plugin reads (watchbill writes and clears them)

| Key | Where | Effect in the plugin |
|---|---|---|
| `review: whole` | note frontmatter, top level | the note is listed in the vault-wide overview under *Needs review* (no `approved_at`) or *Dirty: approved, changed since* (`approved_at` present), counts as one pending item for the status bar; the review panel header shows *Needs whole review* with *Approve this version* |
| `approved_at` | note frontmatter | shown on the row; decides Needs review vs Dirty |
| `review: delta`, `open_marks` | ignored: the plugin counts marks itself | |

## Keys the plugin writes (only on the human's click on Approve)

`status: accepted`, `approved_by` (local author name, else "You"), `approved_at` (seconds, numeric offset), `approved_via: track-changes panel`, `approved_hash` (`sha256:<16 hex>` of the base text), `approved_sha: pending`, `approved_whole_sha: pending`; `review` removed. Refused while suggestions or comments are open. Watchbill (or `obsidian-track-changes-agent approve --fill-sha`) replaces `pending` once a commit holds the text.

## The agent tool's verbs watchbill calls

`obsidian-track-changes-agent drift <note> [--json] [--mark]` (exit 0 clean, 10 delta-open, 11 dirty, 12 needs-review, 13 anchor unreadable) and `approve <note> --by … --via … [--amend]`. Design and fields: `~/dev/claude-plugin-obsidian-track-changes-agent/dev-docs/design/approval-anchor-and-drift.md`.

## Fixture

`test/fixtures/approval/sample.md` + `sample.expected.json`, identical to the agent tool's `tests/fixtures/approval/`; both suites assert the same base and proposed hashes.
