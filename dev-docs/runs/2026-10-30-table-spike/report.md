# Spike: Track Changes inside table cells

Start here: John asked on 2026-10-30, "can you try to make track-changes work within table contents (spike). LMK if it becomes too complicated and we will just avoid using tables instead." This is what works today, what does not, why, and what a fix costs. Tested by trackchg-architect-ho2 in the project's test vault on `test/vault/table.md.fixture` (an addition, a deletion, a substitution, a comment, a highlight and a substitution holding an escaped pipe, each in a cell, plus one mark below the table as a control), plugin at feat/bulk-accept ee61c34.

## What works

- **The review panel** reads every mark in a cell: 5 suggestions, 1 comment and 1 highlight, the escaped-pipe substitution included, each with its card, line number and buttons.
- **Accept and reject** edit the source correctly inside a row: the cursor command accepted the deletion (`| Deletion | the fox | plain |`) and the piped substitution (`| Pipe inside | c \| d | escaped pipe |`, the escape kept, so the table stays a table).
- Counts, the overview and approval are unaffected (they read the source).

## What does not

- **Live Preview shows a table's suggestions as if already accepted** (screenshot `tbl-01-live.png`): "the very quick fox" with no green, the deletion simply gone ("the fox"), "the fast fox" with no trace of "quick". A pending suggestion is invisible in the note itself; only the panel shows it. Outside the table the same marks render as suggestions (the control mark is green).
- No inline chips (#N) and no click-to-panel on marks in a table.

## Why

Obsidian draws a table in Live Preview as a rendered widget, through the same Markdown post-processor as reading view. The plugin's reading post-processor (`src/reading.ts`) renders every mark in its **accepted** form on purpose (reading view is treated as a publish preview), so tables inherit that. The CodeMirror decorations that show suggestions in Live Preview never see a table's cells.

## The fix, and what it costs

Not too complicated, in my judgement: one change in `src/reading.ts`. When the post-processor runs inside a Live Preview table widget (the element sits in the source view, not the preview view), render the marks in **suggestion form** with the existing CSS classes instead of accepted form: an insertion green, a deletion red and struck through, a substitution as both, the highlight and comment icon as now, and a `data-tc-offset` on each so a click opens its card. Reading view keeps the accepted form. About half a day with tests and a test-vault screenshot pass. Limits that stay: a mark cannot span cells or hold a raw `|` or line break (table syntax forbids them; an escaped `\|` works); whether the agent tool escapes `|` when it writes into a table row is not yet checked.

Recommendation: build it (keep tables), rather than avoid tables.
