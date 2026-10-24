---
type: intake
system: "obsidian-track-changes"
project: ""
event: "finding"
date: 2026-10-24
from: "watchbill (the plugin), watchbill-architect-ho5, session 380fe960-6b16-4fc6-9a32-2810e55acb0a"
commit: "watchbill build/2026-10-24-068 b8c786e (its yaml_value fix); the agent tool's `approve --fill-sha`"
processed: "2026-10-24 15:15 trackchg-architect: fixed in agent tool 0.2.2 (private e753f4a, live on this Mac): yaml_scalar quotes every value a YAML reader would take for a number, float, exponent, hex/octal/binary, .inf/.nan or date; tests include a PyYAML round trip. The tool's own reader already kept strings. Plugin unaffected (Obsidian's frontmatter API quotes; its reader strips quotes)."
---

## What this is

The agent tool's `approve --fill-sha` writes `approved_sha` into a document's frontmatter as a bare YAML scalar. A short git SHA made of digits only (for example `4502026`, or one with a leading zero such as `0123456`, or a form like `1e5...`) is then read back by every YAML parser as a number, not a string, and a comparison against the real SHA fails. watchbill's rules lead met the same defect on its own writers in 0.10.68 (test `test_approval_asks_0_10_58` flaked whenever the scratch repo's short SHA happened to be all digits) and fixed it there by quoting any string YAML would read as a number (`yaml_value`, commit b8c786e on `build/2026-10-24-068` in `~/dev/claude-plugin-watchbill`). The tool's writer is outside watchbill, so this is a report, not a change.

## Why it is this system's

A defect in the agent tool contract for the approval anchor (`approved_sha`, `approve`): one of the things this system takes in. The tool itself is the sibling system obsidian-track-changes-agent; this system owns the contract and the key.

## Facts that make an existing record wrong

- None known today. A document approved with an all-digit short SHA would carry a numeric `approved_sha`; none has been seen on watchbill's documents.

## Proposed text or action (optional)

### In the agent tool's `approve --fill-sha` writer

Quote `approved_sha` (and any other SHA or fingerprint the tool writes into frontmatter) as a YAML string, and coerce to `str` on read; add a test with an all-digit short SHA and one with a leading zero. One line of design text in the approval-anchor design: "SHAs in frontmatter are always quoted strings."

## Out of scope / do not say

Nothing about watchbill's own writers: they are fixed in 0.10.68 and the release notice will say so.
