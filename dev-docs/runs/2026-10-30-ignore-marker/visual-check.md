# Visual check: the ignore marker (64899a5)

Start here: the plugin half of the ignore marker landed on feat/bulk-accept as 64899a5. On 2026-10-30 it was checked by eye in the project's test vault (`scripts/test-vault.sh`), on `test/vault/ignored.md.fixture`: every mark kind, with `track_changes: ignore` and `review: whole` in its front matter.

| Screenshot | What it shows | Result |
|---|---|---|
| ign-01-panel | the review panel on the ignored note: the title and the one ignored line, no cards, counts or buttons | pass |
| ign-02-accept-all | *Accept all changes in note* run on it: refused with a Notice naming the key; every mark still in the text | pass |
| ign-03-overview | the pending overview: the ignored note is not listed (ignore wins over `review: whole`); the other test notes are | pass |
