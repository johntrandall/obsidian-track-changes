# Verifier round 1: approval indicator in the review panel

Start here: the cold check of 0adf5b8 (watchbill's intake `intake/2026-10-23-approved-and-clean-indicator.md`: show in the panel when a note was approved and whether it changed since), by a `watchbill:verifier` crew (Sonnet, fresh), 2026-10-23 15:5x EDT; scratch `/private/tmp/claude-502/verify-approval-indicator/`. Result: 4/4 PASS, no defect.

1. **PASS (Verified).** typecheck, `npm test`, `npm run test:webkit` (482 ok), build exit 0; breaking the new indicator assertion makes `node test/approval.test.mjs` exit 1.
2. **PASS (Verified).** 17 notes, anchors written by the tool's `approve`; plugin `approvalState` vs tool `drift --json`: 16 identical (clean, delta-open after a suggestion or an unresolved comment, dirty after a body edit or a stray space, needs-review with `review: whole`, clean with only resolved comments, quoted values and `# comments`, CRLF before or after approval, status line, trailing whitespace, frontmatter-only edit); 1 allowed (never approved: tool needs-review, plugin unapproved). Open-mark counts matched. Code block: the tool refuses to approve (documented divergence).
3. **PASS (Inferred).** Read-only (only `setText`/`addClass` on its own div); skipped without `approved_hash`; stale renders cannot write (`isConnected`, and each render empties the panel). Minor: no `.catch` on the promise; added in the landing commit.
4. **PASS (Inferred).** CLAUDE.md, README and `dev-docs/contracts/watchbill.md` match the code; `drift --json` carries `state`, `approved_sha`, `open_marks`.
