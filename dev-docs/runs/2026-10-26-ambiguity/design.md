# Ambiguity callouts: the syntax lives here; the overview lists open questions

Start here: the design for the intake `intake/2026-10-26-ambiguity-syntax-and-questions-overview.md` (John, 2026-10-26 12:2x, relayed by the calendar system's architect; approval to be confirmed on the card `dev-docs/substantive/2026-10-26-own-the-ambiguity-callouts-list-open-questions.md`). Agreed in outline with watchbill's architect (watchbill-architect-ho6) on 2026-10-26.

**Terms.** An **AMBIGUITY callout** is how an agent marks an open question inside a document: `> [!question] AMBIGUITY · <slug>` followed by the readings weighed and one recommendation. An **ANSWERED callout**, `> [!check] ANSWERED · <slug>`, quotes the human's answer with time and channel; a slug with an ANSWERED is closed. A **slug** is a short kebab-case name unique within the document. The **agent tool** is `obsidian-track-changes-agent`; its Claude Code plugin carries **skills** (instructions agents load). The **overview** is the fork's vault-wide list of notes with pending changes.

## 1. Owner: the agent tool's skill

- New skill `obsidian-track-changes-agent:ambiguity` in the agent tool plugin (`plugin/skills/ambiguity/SKILL.md`), shipped in agent tool **0.4.0**: the two callouts' exact form, one open question per callout where it arises (never a prose list), the recommendation line first after the title (`**Recommendation:** …`), the ANSWERED form with the human's words verbatim plus time and channel, slug rules, and how to close (an ANSWERED callout directly under the AMBIGUITY, or replacing it when the text was rewritten to the answer).
- The fork's `docs/SKILL.md` (the public reviewer template) gains one short section pointing at the same form, so the convention is visible without the plugin.
- Watchbill's skills (decision-board, collaborative-drafting rule 10, document-format rule 6) shrink to "an open question is an AMBIGUITY callout as the obsidian-track-changes-agent skill defines it"; the card link from an AMBIGUITY stays watchbill's. Watchbill lands that after 0.4.0 is on the marketplace or on this Mac (its choice).

## 2. The read verb

`obsidian-track-changes-agent ambiguities <note|folder> [--json]`: every AMBIGUITY callout with no ANSWERED of the same slug in the same note; rows `{path, line, slug, recommendation, title_line}`; exit 0 with rows, 1 with none (`--json` always exit 0). Code blocks skipped (as the plugin parses). `watchbill format check` may call it instead of its own regex.

## 3. The overview's Questions section (fork, jtr.10)

- `src/pending.ts`: `openAmbiguities(source)` returns the open callouts (same rule as the verb); `FileSummary` gains `questions: number`; `pendingCount` includes it; `summarizeSource` keeps its fast path (a note with no `AMBIGUITY` substring is skipped).
- Overview: a **Questions** group after *Needs review* / *Dirty*, one row per open callout: document, slug, the recommendation's first line; click opens the note at the callout's line (`openFileForReview` then `revealOffset`). Status bar: the count joins the total; `describeSummary` says "N questions".
- Review panel header: no change (questions are not marks).
- Tests: `pending.test.mjs` cases for open/answered/code-block; shared fixture `test/fixtures/ambiguity/sample.md` copied to the tool's tests so both agree on the same rows.

## 4. Landing order

1. Agent tool 0.4.0: skill + verb (this project lands; watchbill told).
2. Watchbill's pointer (watchbill lands).
3. Fork jtr.10: overview section (this project lands; needs John's release word as every fork release does).
