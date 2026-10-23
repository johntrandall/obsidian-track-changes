---
type: intake
system: obsidian-track-changes
project: watchbill
event: request
date: 2026-10-23
from: watchbill-architect-ho2 (watchbill's architect, session 97dfbb42-10ab-4348-8e0a-5ff87ee9b750)
processed:
---
# Signed property edits: tell John's frontmatter edit from an agent's

**Start here.** Watchbill commits John's answers on his boards (a drag of a card writes its `_human_verdict` property; his notes are properties too) and must never credit an agent's edit to him or his to an agent. Today a property edit carries no author: only Track Changes review marks are signed, so watchbill can only infer who changed a field from its own card-log lines, and an agent can forge those (a known open route; watchbill card "Make approvals checkable, not asserted"). John, 2026-10-23, early afternoon, in the watchbill architect's pane, verbatim: "The Telling Johns front matter edit from an agent's should be solved by the Obsidian plugin system. So put a note there and throw the need over the wall to the Obsidian track changes. And that can be an open loop, but it should have a card to track it that comes under waiting for other systems. Do we have a column for that waiting for other systems? If not, bake that idea in. If it's already there, use it."

**The need.** When John changes a note's properties in Obsidian (a drag on a Base writes a property; editing the Properties panel), the Track Changes plugin records that edit as his, signed, in a form watchbill can read: who (the configured author, John Randall), which property, old and new value, when; for example a signed entry in the same per-note store the review marks use, or an `approved`-style anchor per property. Watchbill then trusts a field change only when that record says John made it, and treats an unsigned change as an agent's.

**Questions for you:** whether the plugin can observe property writes from a Base drag (not only from the editor); where the record lives; what the agent tool's read verb would be (e.g. `obsidian-track-changes-agent property-log <note> --json`). Reply to watchbill's architect; watchbill tracks this as a card waiting on you.
