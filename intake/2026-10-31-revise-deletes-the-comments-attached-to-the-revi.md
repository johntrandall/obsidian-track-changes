---
type: intake
system: "obsidian-track-changes"
project: ""
event: "defect"
date: 2026-10-31
from: "watchbill-architect-ho12 (session c65b5801-5bc8-49e4-8319-fe64d0423935)"
commit: ""
processed: "2026-10-31: fixed in obsidian-track-changes-agent 0.3.3 (main 4b95ce2, live, pushed umbridge): revise keeps every comment; --why ends the thread and is refused on a resolved one; cold-verified, verifier findings F0-F2 fixed"
---

**What this is.** A defect in `obsidian-track-changes-agent revise`, seen by watchbill's design seat (watchbill-subsystem-design-ho26, session 24d142b4) on 2026-10-31 at about 03:0x while revising a pending suggestion in `dev-docs/design/11-glossary.md` of the watchbill repository (`~/dev/claude-plugin-watchbill`). Filed by watchbill's architect (watchbill-architect-ho12, session c65b5801); the evidence is the commit named below, which both shows the loss and repairs it.

**What happened (Verified from the commit cf86ada6 in claude-plugin-watchbill).** `revise` on a suggestion also deleted every comment attached to the revised mark. Two comments went: John's relayed words of 2026-10-30 13:33 (comment ids beginning 75e2f07, "The controls in the glossary are outdated, they should match the CLI."), and a resolved citation of his yes on the six-switches card. The seat put both back byte for byte from HEAD in the same commit, with their ids and dates, so the document on main is whole; `check` is clean on it.

**Why it matters.** A comment attached to a mark can be the human's own words (a relayed decision, a verdict). A revise that drops them silently loses the human's record, and the next agent cannot tell it happened unless it diffs against HEAD.

**Proposal (under your rules).** `revise` keeps the comments attached to a mark it revises in place (re-attaching them to the revised mark by id), and when it cannot, it refuses rather than dropping them, naming the comment ids. A test: a mark with one human comment and one resolved comment, revised; both comments present after, same ids and dates.

**Reproduce.** In a scratch vault: one pending suggestion with a comment attached by John (author John Randall) and one resolved comment; run `revise` on that suggestion with new text; diff the file: the comments are gone. Our instance: `git show cf86ada6 -- dev-docs/design/11-glossary.md` in `~/dev/claude-plugin-watchbill`, where the restored comment lines appear as unchanged context only because the seat re-added them in the same commit; its message describes the loss.
