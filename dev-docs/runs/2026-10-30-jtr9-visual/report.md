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
