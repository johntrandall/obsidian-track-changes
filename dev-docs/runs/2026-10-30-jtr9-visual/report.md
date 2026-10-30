# Visual check of 2.3.0-jtr.9 before release

Start here: John's rule is visual confirmation before any release that changes what he sees. On 2026-10-30 at about 12:28 EDT, trackchg-architect-ho2 ran the jtr.9 candidate (feat/bulk-accept's plugin code, built 12:23) in a throwaway vault (`tc-visual-check`, in the session scratchpad), opened with `obsidian-vault-setup open`, the build written through Obsidian's own vault API, and screenshots taken with the window's own `capturePage`. John chose a test vault over the VM ("we want to use the smallest testing surface we can"). The vault was closed and forgotten afterwards.

| Screenshot | What it shows | Result |
|---|---|---|
| 02 | a `review: whole` note with only resolved threads: header "0 comments · 0 suggestions · 2 resolved", Approve this version offered | pass |
| 03 | Approve clicked: approved, front matter written, header "✓ Approved … · unchanged since · not yet committed" | pass (John's defect of 2026-10-30: jtr.8 refused this note shape with "5 … still open") |
| 04 | a note with one unresolved and one resolved thread: Approve refused, "1 unresolved comment still open" | pass |
| 05 | that thread marked resolved in the panel, Approve again: approved | pass (John's flow) |
| 06, 07 | approved, then text changed: "Changed since approval" | pass |
| 08 | approved, then a suggestion added inside the approved text: "unchanged, 1 open since" | pass |
| 09 | pending overview beside the panel | pass |

Hover text: Obsidian draws a tooltip only on a real pointer, so it was checked in the DOM instead: all 14 buttons in the review panel and the overview carry an `aria-label` (none missing).

## Release and rollout

Released 2026-10-30 12:38 EDT: `deployed` 25566f3, tag `2.3.0-jtr.9`, GitHub release "2.3.0-jtr.9 (fork build)" (Latest, assets main.js, manifest.json, styles.css; the fork has no release workflow, so `gh release create` after `make release`). Rolled into all 16 open vaults that have the plugin with `scripts/update-open-vaults.sh` (no window raised; BRAT left as found, unlike the old script, which switched it off): every one reports manifest 2.3.0-jtr.9 and, where the plugin is enabled, running 2.3.0-jtr.9 (`decisions` has the plugin off, as before). The first pass timed out on six vaults because the `~/dev` vault's window did not answer scripts and the lookup waited on it; a 3-second per-window timeout fixed that. Closed vaults: BRAT updates them at their next open only where BRAT is enabled (18 of 48 vaults with the plugin; the old script disabled it in the others).
