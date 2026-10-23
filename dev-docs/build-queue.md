# Build queue: obsidian-track-changes

Start here: the ordered list of what this software project owes next, written 2026-10-23 by the founding architect (session 8a6e4f5e) at the human's request ("once you decide all the next steps and lay them out, you should hand it to a fresh architecture"). Each item names what done means. The architect takes them in order unless the human reorders; crew per item, gone after it.

| # | Item | Done means | Depends on |
|---|---|---|---|
| 1 | **Land the mobile harness** (builder `mobile-harness-builder`, branch `feat/mobile-harness`, brief `dev-docs/briefs/2026-10-23-mobile-test-harness.md`) | `npm run test:webkit` green; `scripts/vm-test.sh smoke-mobile` run once with screenshots in `dev-docs/runs/<date>-mobile/`; `dev-docs/testing/ipad-checklist.md`; merged to `feat/bulk-accept`, then `deployed`, released as jtr.9 and rolled into the open vaults | the VM's first vault (needs John's Accessibility grants in the golden image, or a GUI click) |
| 2 | **Golden image TCC principals, finish** | John approves Accessibility for the four principals in `macos-15.7-l2-dev`; `tart-vm stop macos-15.7-l2-dev`; inventory entry `~/admin-technical/inventories/vm-images/macos-15.7-l2-dev.md` updated (principals, grants, date); re-clone `obsidian-track-changes-dev` from it; `tailscale serve --tcp=5901 off` | John |
| 3 | **Agent tool public release** (0.1.12 and 0.2.0) | John's word; `release/export.sh`, clean-install test, public push, `claude plugin marketplace update`, sessions restarted; watchbill told | John |
| 4 | **`approve --fill-sha` in a sweep** | decide with watchbill who fills `approved_sha: pending` (their sweep or a git hook here); documented in `dev-docs/contracts/watchbill.md` | watchbill 0.10.52 |
| 5 | **Upstream PR decision** (2026-10-27) | the upstream steward asks John; on yes, PR from `feat/resolve-threads` after #55; this project supplies the PR text from README/SKILL/CLAUDE.md | upstream system |
| 6 | **`resolve --addressed-by` duplicate comments** (agent tool) | one agent comment per addressed suggestion, not two (the `--why` and the quote note); observed in the 2026-10-20 one-shot run | — |
| 7 | **Status-bar count and overview on mobile** | verified under emulation and once on the iPad (checklist) | 1 |
| 8 | **Code-block divergence in base text** | the agent tool's parser skips code blocks like the plugin's, or the design records the divergence as accepted; shared vectors gain a code-block case | — |
| 9 | **Rollout script into the repo** | `scripts/rollout.sh <version>` = `install-fork-v2.sh` (unlocked screen) + `update-in-windows.sh` (locked screen) from the founding session's scratchpad, with the vault list computed from `obsidian.json` and never opening a closed vault | — |
| 10 | **Standing autonomy** | asked once when the architect goes dormant; recorded in `dev-docs/decisions.md` | John |
| 11 | **Signed property edits** (intake `intake/2026-10-23-signed-property-edits.md`, from watchbill-architect-ho2) | design agreed with watchbill (threat level, where the record lives, which edit paths); verify a Base drag is observable in the project VM; plugin logs property changes with trusted-input evidence; agent tool `property-log` verb; contract in `dev-docs/contracts/watchbill.md` | VM (item 2), watchbill reply |
