# Spike: Track Changes marks and fenced code blocks

Start here: the answer to watchbill's intake `intake/2026-10-29-track-changes-marks-in-code-blocks-spike.md` (John, 2026-10-29 08:28, relayed by watchbill-subsystem-cli: suggestions on terminal mocks kept in fenced code blocks did not render). Written by trackchg-architect (session 988b396b), 2026-10-29 08:4x EDT. Probes and samples are in this folder; run a probe from the repo root with `node node_modules/.probe/probe.mjs <files>` after copying it there.

**Terms.** A **fence** is a fenced code block (```` ``` ```` lines). A **mark** is a CriticMarkup suggestion (`{~~old~>new~~}`, `{--…--}`, `{++…++}`). **Parses** means the plugin's own parser (`src/parser.ts`) returns the mark as a node; only parsed marks get inline colour, a panel card and accept/reject. **Render** means what Obsidian shows in Live Preview and Reading view.

## Findings (parser and resolution: Verified, run on the plugin's own code)

| Shape | Sample | Parses | Accept / reject leave a valid fence |
|---|---|---|---|
| Mark inside a fence | `v3-inside.md` | no (by design: the plugin skips markup in code) | n/a |
| Whole-block substitution as written on 2026-10-29 (`~>` glued to the fences: a line reads ```` ```~>```console ````) | `v0-as-written.md` | **no**: that line starts a fence, so the mark is swallowed | n/a |
| Whole-block substitution with `{~~`, `~>` and `~~}` each on its own line | `v1-sub-own-lines.md` | **yes**, one suggestion | yes, both (one balanced fence left) |
| Deletion of the old block then addition of the new, each marker on its own line | `v2-del-add.md` | **yes**, two suggestions | yes, both |

The control mark in prose on the same mock (watchbill d912dab0, line 11) parses as a substitution with its comment: the plugin works on that note (jtr.8 is installed and enabled in that vault).

## Answers

1. **Inside a fence: no, and not to be changed.** The plugin deliberately leaves markup in code alone, so that examples of CriticMarkup in code (its own docs, this report) are never treated as live marks. Changing that would make every code sample a potential suggestion.
2. **Around whole blocks: yes, if every marker stands on its own line.** Shape `v1` (one substitution) or `v2` (deletion + addition). **Render is not yet confirmed** (John's rule, 2026-10-29: visual confirmation before release): next step is the helper writing `v1` into the mock and John looking at it, or a screenshot from the project VM once the golden image has its grants.
3. **The agent tool should guard this.** Proposed for the tool's next version, held on a branch until the render is confirmed: `suggest` refuses a mark whose position is inside a fence ("a mark inside a code block never renders; suggest a replacement of the whole block instead"); when `--old` or `--new` contains a fence line, `suggest` writes the markers on their own lines (shape `v1`) instead of gluing them.
