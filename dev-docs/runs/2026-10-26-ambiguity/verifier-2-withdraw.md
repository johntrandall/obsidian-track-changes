# Verifier round 1: agent tool 0.4.1 (withdraw), branch build/withdraw

Start here: the cold check of the agent tool's `withdraw` verb (82b110f on `build/withdraw`, built by a worker crew; card `dev-docs/substantive/2026-10-26-let-a-seat-withdraw-its-own-suggestion.md`), by a `watchbill:verifier` crew (fresh), 2026-10-26 13:5x EDT; scratch `/private/tmp/claude-502/verify-withdraw/`. Result: 6/6 PASS; two defects fixed in 4347f83 on the branch. Merges on John's yes.

1. **PASS (Verified).** 113 tests OK; release tests OK; plugin validates.
2. **PASS (Verified).** Insertion, deletion and substitution withdrawn by id and by number: the note equals the original byte for byte.
3. **PASS (Verified).** Every refusal with its message: the human's mark (unsigned or named), another role's, a comment, a highlight, a suggestion the human replied to, one inside a resolved thread, no or blank `--why`, a stale number (the id still works).
4. **PASS (Verified).** `withdrawn.json` holds path, id, kind, author, raw text, why, when; the agent-removed record holds the key; `watch` does not report the withdrawal as the human's decision (a real reject in a control note is reported).
5. **PASS (Verified).** `accept` still refuses agents' suggestions; no `reject` verb; no argument combination lets withdraw touch a human's mark.
6. **PASS (Verified).** The diff is the verb, its help, the version and changelog lines, and tests.

Defects fixed in 4347f83: `withdraw` lacked `--if-hash` (now in WRITE_VERBS); it removed another role's attached comment along with the suggestion (now refused: "only a suggestion no one else has commented on can be withdrawn"). Known, not new: the agent-removed key has no file, so an identical suggestion elsewhere could be masked (as with `revise`).
