# Stable mark ids and a stale-number guard (agent tool)

Start here: the design for watchbill's intake `intake/2026-10-25-revise-by-mark-number-overwrote-another-mark-while-the-human-reviewed.md` (8deb90e). In callimachus on 2026-10-25 13:24 EDT, `revise --marks N` rewrote the wrong suggestion: John accepted marks in the panel between the agent's `list` and its `revise`, so position N named a different mark. Positions are not stable while the human works; the tool must notice. Decided by trackchg-architect 2026-10-25 13:3x; additive to the contract, so no card: every existing call keeps working, and a call that would have hit the wrong mark is refused instead.

**Terms.** A **mark** is one CriticMarkup suggestion or comment. Its **number** is its position in `list` (1-based), which shifts when any earlier mark is accepted, rejected or removed. Its **id** (new) is 7 hex characters derived from what the mark is, not where it is. The **state dir** is `~/.local/state/track-changes/` (`STATE`), where the tool already keeps block records.

## 1. Stable ids

- `id = sha1(kind | author | date-or-time | old | new-or-text)[:7]`; when two marks in one file share that, the later ones get `-2`, `-3` appended (duplicate replies are common). Computed by `mark_id(marks, i)` at parse time; never stored in the note.
- `list` prints the id after the number: `#3  a1b2c3d  L51 …`; `--json` rows gain `"id"`.
- Every verb that names a mark accepts an id wherever it accepted a number: `revise --marks`, `accept n`, `reject n`, `resolve n`, `acknowledge n`, `comment --on`, `resolve --addressed-by`, and any other `type=int` mark argument. A token of 7 hex characters (optionally `-N`) is an id; all-digit is a number; ranges (`3-12`) stay numeric. Refusal names the id when it no longer exists ("no mark a1b2c3d: it was accepted, rejected or revised; run `list`").

## 2. Stale-number guard

- `list` (and every write verb, after its write) records `{path → sha1 of the file text}` in `STATE/seen.json`.
- A write verb addressing a mark **by number** compares the file's current hash with the recorded one: if they differ (or none is recorded), it refuses: "the file changed since your last `list` (N marks then, M now); run `list` again, or address the mark by its id". Ids are never refused on this ground.
- `suggest` (anchored by text, not number) and `comment --after TEXT` are unaffected.
- The hash is of the whole text, so John's non-mark edits also trip it; that is intended (the agent should re-read).

## 3. Not done

- No change to the plugin or the panel; nothing in notes.
- The commit half (watchbill collaborative-drafting rule 6: commit the human's state by path first) stays watchbill's practice; the refusal message points at it.

## Tests

- id stable under an earlier mark's removal; duplicates get `-2`; every number-taking verb accepts an id; `revise --marks N` refused after an outside edit, accepted after `list`; `revise --marks <id>` works through the same edit; `--json` carries `id`.

## 4. Addendum (watchbill P13, 13:4x): explicit preconditions

- `--if-hash sha256:<16 hex>` on every write verb: the hash `hash` prints (`text_hash` of the whole file text, not the base text); refused when the file's current hash differs, printing the current one. For callers that want the precondition explicit instead of the recorded-`list` guard.
- `--expect "<old text>"` on `revise`: refused unless the chosen mark's old text (or, for an insertion, its text) equals it after whitespace normalization; a second check that the number or id names the mark the caller means.
- `--mark-id author@time` from P13 is covered by the id (author and date are in it).
