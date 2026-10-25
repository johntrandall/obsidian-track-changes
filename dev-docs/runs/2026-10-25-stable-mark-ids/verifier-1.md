# Verifier round 1: agent tool 0.3.0 (stable mark ids, stale-number guard)

Start here: the cold check of the agent tool commit 8b3eb9f, built by a worker crew from `design.md` in this folder, by a `watchbill:verifier` crew (fresh), 2026-10-25 13:5x–14:1x EDT; scratch `/private/tmp/claude-502/verify-mark-ids/`. Result: 7/7 PASS, no defects.

1. **PASS (Verified).** Main suite 97 tests OK; release tests 4 OK; exit codes 0.
2. **PASS (Verified).** The original defect reproduced and refused: three suggestions, `list`, the human accepts #1 (file edited), then `revise --marks 2` is refused ("the file changed since your last `list` (3 marks then, 2 now); run `list` again, or address the mark by its id …"); `revise --marks 6960d16` changes the right mark; after `list`, numbers work again.
3. **PASS (Verified).** accept, acknowledge, resolve, resolve --addressed-by, comment --on and revise --marks all take an id (mixed with numbers and ranges).
4. **PASS (Verified).** `--if-hash` refused with the current hashes printed on suggest, accept, comment, acknowledge, resolve, revise, block, approve; `hash --whole` passes; `revise --expect` refuses a wrong old text, whitespace normalized.
5. **PASS (Verified).** Ids unchanged after an earlier mark is accepted; identical replies get `-2`.
6. **PASS (Verified).** Mark format in the note unchanged; ids never stored in the note; seen.json in the state dir only.
7. **PASS (Inferred).** Caller-visible changes all in the design: a number-addressed write needs a recorded `list` and is refused after any file change since; `list` gains an id column and writes seen.json; own writes refresh the record.

Known limits (not defects): `--if-hash` also accepts the base-text hash; `seen.json` is keyed by path, not by agent, so two agents sharing one state dir on one note refresh each other's record (ids avoid this; one editor seat per document is the practice); messages say "mark N" even when an id was given.
