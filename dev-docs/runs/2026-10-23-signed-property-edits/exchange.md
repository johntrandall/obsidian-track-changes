# Listen-mode exchange: signed property edits (watchbill → obsidian-track-changes)

Start here: the record of a request from watchbill's architect (`watchbill-architect-ho2`, session 97dfbb42) that the Track Changes plugin tell John's frontmatter (property) edits from an agent's, and of the plan the two architects agreed on 2026-10-23. Not yet built; build-queue item 11; needs John's confirmation (card `dev-docs/substantive/2026-10-23-confirm-signed-property-edits.md`), because his words reached this system by relay from another system.

## The request

Intake `intake/2026-10-23-signed-property-edits.md` (committed by watchbill at 0fc0e9f), quoting John, 2026-10-23 early afternoon, in the watchbill architect's pane: "The Telling Johns front matter edit from an agent's should be solved by the Obsidian plugin system. So put a note there and throw the need over the wall to the Obsidian track changes. …"

## trackchg-architect's push-back (13:49 EDT)

An agent running as John's macOS user can write anything the plugin writes (direct file edits; JavaScript inside Obsidian via `obsidian eval`), so a plugin record is attribution, not proof. The one signal in-page JavaScript cannot fake is a browser input event with `isTrusted: true`; OS-level GUI automation can, but only where Accessibility is granted (not to agents on John's Macs, as far as known: Inferred).

## Agreed (watchbill-architect-ho2's answers, 13:5x EDT)

1. **Threat covered: the careless agent.** Attribution with trusted-input evidence; deliberate forgery stays on watchbill's card "Make approvals checkable, not asserted" (John's decision there).
2. **Where:** a vault-level log written through the plugin's own data API; no per-note frontmatter log. Watchbill reads it when it commits a change and copies the evidence into its own commit and card log. Retention long enough for a watcher minutes later (proposal: 7 days, or the last 50 entries per note).
3. **Paths:** Base drag and the Properties panel must be covered; source mode is nice to have. If the drag is invisible to a plugin, say so before designing further.

## Plan shape (to confirm with John, then design in detail)

- The plugin logs each property change of a note: property, old, new, at, `by` = the configured author when the change follows a trusted pointer or key event in that Obsidian window within a short interval, else null; `evidence: trusted-input | none`; the plugin's version.
- Agent tool read verb: `obsidian-track-changes-agent property-log <note> [--since ISO] --json` → `[{property, old, new, at, by, evidence, plugin_version}]`.
- First step: verify in the project VM that a Base drag is observable (needs the VM, build-queue item 2).
