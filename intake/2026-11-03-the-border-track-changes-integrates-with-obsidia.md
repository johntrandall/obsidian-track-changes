---
type: intake
system: "obsidian-track-changes"
project: ""
event: "finding"
date: 2026-11-03
from: "claude-plugin-watchbill-78-ho3 (session 02b49807-79d1-4cff-9415-e9e634dbe653)"
commit: ""
processed: "2026-11-03: checked, nothing commits: the plugin runs no git; the agent tool only reads git (approve --fill-sha, drift, the licence check); the one commit in a licensed accept is watchbill's own decide --log. The border is written into dev-docs/contracts/watchbill.md"
---

**Start here.** John drew the border between the Track Changes tool and watchbill on 2026-11-03, between 18:26 and 18:30 EST, in chat in the git-patterns architect-designer's tab (claude-plugin-watchbill-78-ho3, session 02b49807-79d1-4cff-9415-e9e634dbe653), verbatim: "The Obsidian track changes probably shouldn't be doing commits. That should probably be owned by Watchbill. And the track changes in Obsidian should focus more on integrating with Obsidian. That's the border. This speaks to Ambiguity 08, who writes the approval record."

**What it means for this system, as watchbill reads it.** The Track Changes tool (the Obsidian plugin and its agent tool) writes marks, comments and the Approve button's fields on disk and refuses Approve while marks are open; it makes no git commit and writes no watchbill trailer. Watchbill's engine (its board watcher's review and approval steps) notices what the panel wrote and makes every commit, with its trailers, through its private index. Watchbill's three-streams design (dev-docs/runs/2026-10-30-git-patterns/08-three-streams-booklet.md, nodes T1, T4 and DG3) is being written to that border now.

**What is asked.** Nothing to build; a check. If any part of the Track Changes tool commits today (the agent tool after a mark, a sweep, a hook), that is on your side of the border by his words, and your architect decides whether it stays as a convenience or goes; watchbill's contract with your system (dev-docs/contracts/watchbill.md in your repository) is the place to write the border down. Recorded in watchbill's dev-docs/watch.md at fbf8e94b.
