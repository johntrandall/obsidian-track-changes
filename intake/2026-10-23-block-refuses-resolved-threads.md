---
type: intake
system: "obsidian-track-changes"
project: ""
event: "finding"
date: 2026-10-23
from: "watchbill (the plugin's architect, watchbill-architect-ho3, relaying the document steward watchbill-copy-editor's findings), session b4d4da71-9b54-4894-a9c7-589e04e99223"
commit: "obsidian-track-changes-agent 0.2.0"
processed: null
---

## What this is

**Start here.** Two more findings about the agent tool, of the same class as [[2026-10-23-approve-refuses-resolved-comments|the approve defect filed at 14:5x]] (a resolved comment should never block anything), found by watchbill's document steward on 2026-10-23 at about 14:5x while turning a paragraph of `dev-docs/design/00-overview.md` into a bulleted list as Track Changes suggestions.

1. **`block` refuses a range whose old lines hold only resolved comment threads.** Command: `obsidian-track-changes-agent block 00-overview.md --as editor --first '**Mode: what a system is doing at a time' --last 'and says which.' --new-file <file>`. Refusal: `refused: the old lines hold marks; resolve or revise them first`. The marks are resolved threads of an earlier editor; `tidy --as editor` does not clear them (it refuses: "no recorded block suggestions for this note", since it clears block suggestions only). `suggest` (a replace) on the same lines is **not** refused, so the two commands disagree about what a resolved thread blocks (Verified by the steward, both commands run on the same paragraph).
2. **`revise` refuses a whitespace-only change.** `revise --marks N,N+1 --new-file <file>` with a text that differs from the original only by a newline in place of a space is refused with `the revision equals the original text; nothing to suggest`, so a pure paragraph break (or a list break) cannot be proposed; the steward had to add a word to get a difference accepted.

**Workaround in use:** one single-line `suggest` per break point, then `revise --marks N,N+1 --new-file` with the multi-line text, plus one real word change. It works and is clumsy.

## Why it is this system's

Both are the agent tool's contract (what blocks an edit; what counts as a change), which this system takes in.

## Facts that make an existing record wrong

- The `block` refusal text says "resolve … them first" for marks that are already resolved.

## Proposed text or action (optional)

1. `block` treats resolved and acknowledged comment threads as `suggest` does: they do not block; they are carried into the new text at the nearest position (or dropped with a note in the tool's output if the anchor text is gone).
2. `revise` compares the texts as written, so a whitespace-only difference (a newline, a list marker on its own line) is a change; or, if the equality check is deliberate for the inline case, accept the change when it alters line structure.
3. Tests for both; ship with the approve fix (0.2.1) if that is convenient, and tell watchbill-architect-ho3 the version.

## Out of scope / do not say

No change asked to the plugin's review panel for these two; they are tool-side.

---
Created by Claude Code 2026-10-23
Claude-Session-Id: b4d4da71-9b54-4894-a9c7-589e04e99223
Resume: claude --resume b4d4da71-9b54-4894-a9c7-589e04e99223
