# Cycle brief: 2026-10-23-mobile-harness

Start here: the first build cycle of the obsidian-track-changes system (the fork of the Obsidian Track Changes plugin John reviews documents with) after it adopted watchbill on 2026-10-23. It is build-queue item 1 (`dev-docs/build-queue.md`): land the mobile (iPad) test harness an Opus builder is writing, so that John can trust the review panel on his iPad. The architect is `trackchg-architect` (session 988b396b-f824-464e-83db-39e5a05961e0); there is no steward, because this is a software project (the plugin does the work in John's vaults).

Terms. **Harness**: the tests and scripts that exercise the plugin as it would run on the iPad; three layers, because Obsidian for iOS cannot run in an iOS simulator (App Store build, no simulator binary): the unit tests run in Playwright's **WebKit** engine (the iPad's browser engine), Obsidian desktop's **mobile emulation** (`app.emulateMobile(true)`) driven in the project VM, and a **manual checklist** for the real iPad. **Project VM**: `obsidian-track-changes-dev`, a local Tart macOS VM driven by `scripts/vm-test.sh`. **Integration branch**: `feat/bulk-accept`. **`deployed`**: the branch releases are cut from (manifest bump, tag `2.3.0-jtr.N`, `gh release create … main.js manifest.json styles.css`; the fork's GitHub Actions never run). **Rollout**: installing a release into every open Obsidian vault on John's Macs, never opening a closed vault.

## The human's request (verbatim)

John, 2026-10-23 ~12:00 EDT, chat in the founding session's tab ("CriticMarkup comment resolved state", session 8a6e4f5e), relayed verbatim and complete by `obsidian-track-changes-df` at 12:12 EDT:

> "On iPad, how do I make a change in the document that is tracked? Do you have a testing harness that includes, um, testing how this functions in the iPad? How complicated would it be to make one? If that's something that can be done in a day, orchestrate its build, using an Opus builder, to extend the testing suite, so that we can be sure that this all works on iPad, too. I guess you need to use some sort of iOS simulator. We probably have that set up one machine. Check it out.  Also, you should adopt the watch bill system, as it currently exists, you play the architect role, and, uh, once you decide all the next steps and lay them out, you should handle it to a fresh architecture."

Approval of record: this request, recorded in `dev-docs/decisions.md` (row 2026-10-23 "Adopt watchbill; a fresh architect takes over") and on the board as an approval card (`dev-docs/substantive/2026-10-23-mobile-test-harness-cycle.md`). Its bound: "if that's something that can be done in a day". It does not by itself ask for a release; see the gate, criterion 5.

## The gate

| # | Criterion | Evidence |
|---|---|---|
| 1 | `npm run typecheck && npm test` green on `feat/bulk-accept` after the merge | command output in `gate.md` |
| 2 | `npm run test:webkit` green (fails on any assertion failure; a deliberately broken assertion makes it exit non-zero) | output, plus the broken-assertion check by the verifier |
| 3 | `scripts/vm-test.sh smoke-mobile` run once, its screenshots in `dev-docs/runs/2026-10-23-mobile/` and looked at by the architect; or the human-blocker named exactly (what John must click, and the command to run afterwards) | the screenshots, or the card naming the blocker |
| 4 | `dev-docs/testing/ipad-checklist.md` present and readable cold; README *Testing on iPad* and CLAUDE.md coverage paragraph present | file paths; a reader's cold read |
| 5 | Release: if the merge changes anything that ships (`src/**`, `styles.css`, `manifest.json`), cut `2.3.0-jtr.9` from `deployed` and roll it into every open vault (John's standing instruction, 2026-10-20: "make sure the obsidian track changes is installed into all Obsidian vaults that have been touched in the last 90 days"; "close them as you go, or we will get ram-exhausted"); if it changes only tests, scripts and docs, no release is owed and `gate.md` says so with the diff stat | `git diff --stat` of the merge; release URL and per-vault versions, or the no-release line |
| 6 | Independent verifier (`watchbill:verifier`, Sonnet) passes the merged branch cold | its report, committed with `Watchbill-Event: verified` |

Per-item outcome numbers: this cycle has one item (the harness); `gate.md` records per criterion pass / fail / blocked-on-human, with the evidence path.

## Seats and ownership

- Architect `trackchg-architect` (opus, high): owns everything in `dev-docs/owners.yaml` under `architect`; merges, lands, releases.
- Builder `mobile-harness-builder` (Opus sub-agent of the founding session, launched 2026-10-23 12:0x; brief `dev-docs/briefs/2026-10-23-mobile-test-harness.md`): writes only its worktree branch `feat/mobile-harness`; reports to the founding session, which forwards to the architect. Not duplicated.
- Verifier: `watchbill:verifier` crew, fresh, reads the merged branch; writes nothing.
- No rules leads this cycle.

## Worktree and landing

Worktree `../obsidian-track-changes-2026-10-23-mobile-harness` on `build/2026-10-23-mobile-harness`, branched from `feat/bulk-accept`; `feat/mobile-harness` is merged into it there, verified, then `watchbill land build/2026-10-23-mobile-harness --backfill none --steward none --cycle 2026-10-23-mobile-harness --approved dev-docs/substantive/2026-10-23-mobile-test-harness-cycle.md` into the primary checkout (`feat/bulk-accept`). The gate `watchbill land` runs is `npm test` (no `tests/run-all.sh` in this repo; if `land` finds no gate, `--no-gate` with the reason and run `npm run typecheck && npm test` by hand).

Shape: software project (`references/shapes.md`). Steward: none: a software project (dormant 🌙 after the gate, `watchbill:architect` section 7). Scheduled fallback: none.
Never spawn a forbidden model; pass the model on every spawn and on every generic Agent call.
Context: offer a handoff at the cost band; hand off at the hard line (`watchbill context`).
After the gate: dormant 🌙 with the probes in `dev-docs/watch.md`; standing autonomy asked once (section 7), as a board card.

## Outside this cycle (cards for John, on the board)

Accessibility grants in the golden image `macos-15.7-l2-dev` (build-queue item 2; blocks criterion 3 if the VM's first vault needs a GUI click); public push of the agent tool 0.1.12 / 0.2.0 (item 3); Tailscale in the golden image. Each is its own card on `dev-docs/substantive/_substantive.base`.
