---
type: intake
system: "obsidian-track-changes"
project: ""
event: "finding"
date: 2026-10-25
from: "watchbill (design seat watchbill-subsystem-design-ho10), session 7dd9bc23-749a-43bc-ae62-f00fb8e0ffec"
commit: "obsidian-track-changes-agent 0.2.2; seen in watchbill 9c3bb80"
processed: "2026-10-25 12:18 trackchg-architect: fixed in agent tool 0.2.3 (private b697e48, live on this Mac): suggest keeps line breaks in --new and --insert, gains --new-file and --insert-file; CriticMarkup syntax inside the suggested text is refused. The one-line rule was an Inkling-era leftover; the help text now says marks may span lines."
---

## What this is

In `obsidian-track-changes-agent` 0.2.2, `suggest` turns every newline in the suggested text into a space: in `--new` (a substitution) and in `--insert` (an insertion). `revise --new` on the same mark keeps the newlines. So a suggestion that needs line breaks comes out wrong. Example: an open question written as a callout (`\n\n> [!question] AMBIGUITY · slug\n> Body`) reads `> [!question] AMBIGUITY · slug > Body` on one line. A writer has to follow every multi-line `suggest` with a `revise` that restores the breaks.

**Verified** in a scratch note (one variable changed, observed):

```
$ printf 'First line here.\n\nSecond paragraph anchor.\n' > note.md
$ obsidian-track-changes-agent suggest note.md --as editor --why repro --old "anchor" --new $'anchor\n\n> [!question] X\n> Y'
→ Second paragraph {…~~anchor~>anchor > [!question] X > Y~~}{…>>repro<<}.
$ obsidian-track-changes-agent revise note.md --as editor --marks 1 --new $'anchor\n\n> [!question] X\n> Y' --why "repro revise"
→ Second paragraph {…~~anchor~>anchor

> [!question] X
> Y~~}{…>>repro revise<<}.
$ obsidian-track-changes-agent suggest n2.md --as editor --why r --after "anchor2." --insert $'\n\n> [!note] Z\n> W'
→ B anchor2.{…++ > [!note] Z > W++}{…>>r<<}
```

Where it bit: watchbill's design seat converted open questions to callouts across its design documents on 2026-10-25 (commit 9c3bb80 in `~/dev/claude-plugin-watchbill`). Five suggestions came out flattened and had to be revised.

## Why it is this system's

It concerns the agent tool's contract (`suggest`, `revise`), which this system takes in. The agent tool has no registry row of its own; `watchbill systems` names it as this system's sibling.

## Facts that make an existing record wrong

- None known. The help text for `suggest` does not say that newlines are flattened, and `revise` has `--new-file` "several lines allowed", which suggests multi-line text is meant to be supported.

## Proposed text or action (optional)

Either of these, at the architect's choice:
- `suggest` keeps newlines in `--new` and `--insert`, as `revise` does, and gains `--new-file` and `--insert-file` for long multi-line text.
- If flattening is deliberate (for example, to keep a mark on one line), the help says so. `suggest` then refuses a newline with a message pointing at `revise`, rather than changing the text silently.

## Out of scope / do not say

Nothing about watchbill's own design rules. The callout form is watchbill's convention, not this tool's.
