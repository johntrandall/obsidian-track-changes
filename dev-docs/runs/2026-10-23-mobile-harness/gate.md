# Gate: cycle 2026-10-23-mobile-harness (open)

Start here: the per-criterion record of the first cycle's gate (criteria in `briefs/cycle.md`). The cycle stays open until criteria 3 and 5 are met; each waits on a card of John's. Written by trackchg-architect (session 988b396b), 2026-10-23 12:40 EDT.

| # | Criterion | State | Evidence |
|---|---|---|---|
| 1 | `npm run typecheck && npm test` green on `feat/bulk-accept` after the merge | **pass** | at 93f0c41: typecheck exit 0; `npm test` exit 0, 490 ok lines |
| 2 | `npm run test:webkit` green and fails on a failing assertion | **pass** | at 93f0c41: exit 0, "22 files passed, 0 failed, 1 skipped; 480 ok test cases"; mutation check in `verifier-1.md` §2 (exit 1, "FAIL bulk.test.mjs") |
| 3 | `scripts/vm-test.sh smoke-mobile` run once, screenshots looked at | **blocked on John** | Obsidian in the VM shows no window until a vault is opened by hand and its CLI switched on (`dev-docs/runs/2026-10-23-mobile/vault-registration-attempts.txt`, screenshot looked at: desktop and menu bar only). Unblocked by the card `dev-docs/substantive/2026-10-23-accessibility-grants-in-the-golden-vm.md` (agent then clicks it through in the re-cloned VM) |
| 4 | iPad checklist present, readable cold; README and CLAUDE.md sections | **pass** | `dev-docs/testing/ipad-checklist.md`; `verifier-1.md` §5 and §6; README one-time WebKit install line added (2eeec4b) |
| 5 | Release jtr.9 if shipped code changed, rolled into every open vault | **blocked on John** | shipped change: `src/panel/view.ts`, `src/pending.ts` (38a8720), so a release is owed. `deployed` merge committed (b0f5220); the version-bump commit, tag and push refused by the permission check ("Production Deploy"). Card `dev-docs/substantive/2026-10-23-release-track-changes-2-3-0-jtr-9.md` |
| 6 | Cold verifier passes the merged branch | **pass** | `verifier-1.md`, 7/7, commit 2eeec4b (`Watchbill-Event: verified`) |

Landing: 93f0c41 on `feat/bulk-accept` (`watchbill land`, approval `dev-docs/substantive/2026-10-23-mobile-test-harness-cycle.md`).
