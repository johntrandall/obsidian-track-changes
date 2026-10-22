// Vault-wide pending work: what one file still holds for review, and how a
// list of such files is ordered and filtered. Pure functions — no Obsidian
// imports — so the overview view and the status bar share one definition of
// "pending" and the test suite can pin it.
//
// The counts mirror the review panel's header exactly (same parse, same
// anchor rules): a thread anchored on a change is part of that suggestion,
// not a comment of its own; a highlight anchoring a thread is part of the
// thread; `aitext` marks are visual-only and never count; a thread the user
// has resolved (`resolved=` on its root) is kept in the note but not pending.

import { anchorNodeIndexes, changeThreads, isChangeNode, parse } from "./parser";
import { resolvedHighlightIndexes, resolvedThreadIndexes } from "./resolution";

export interface FileSummary {
  /**
   * Frontmatter flag `review: whole` (watchbill's review-modes contract,
   * 2026-10-22): the note needs reading as a whole, marks or not. The plugin
   * only reads it; whoever set it clears it.
   */
  reviewWhole: boolean;
  /** Frontmatter `approved_at`, display-only, or null. */
  approvedAt: string | null;
  /** Additions, deletions and substitutions awaiting accept/reject. */
  suggestions: number;
  /** Comment threads not anchored on a suggestion and not resolved by the user. */
  comments: number;
  /** Highlights that are not a thread's anchor and not resolved by the user. */
  highlights: number;
}

export interface FileRow extends FileSummary {
  path: string;
}

export const EMPTY_SUMMARY: FileSummary = {
  reviewWhole: false,
  approvedAt: null,
  suggestions: 0,
  comments: 0,
  highlights: 0,
};

/** Total review items in a summary: the marks, plus one for a whole-review flag. */
export function pendingCount(s: FileSummary): number {
  return s.suggestions + s.comments + s.highlights + (s.reviewWhole ? 1 : 0);
}

/** Marks only (what the chips show). */
export function markCount(s: FileSummary): number {
  return s.suggestions + s.comments + s.highlights;
}

/**
 * The two review keys from a leading YAML frontmatter block, read with a
 * plain scan (top-level `key: value` lines only) so the index never waits on
 * Obsidian's metadata cache. Values are unquoted; `review` is lowercased.
 */
export function readReviewFrontmatter(source: string): { review: string | null; approvedAt: string | null } {
  const out: { review: string | null; approvedAt: string | null } = { review: null, approvedAt: null };
  if (!source.startsWith("---")) return out;
  const end = source.indexOf("\n---", 3);
  if (end === -1) return out;
  const block = source.slice(3, end);
  for (const line of block.split("\n")) {
    const m = /^(review|approved_at):[ \t]*(.*?)[ \t]*$/.exec(line);
    if (!m) continue;
    const value = m[2].replace(/^["']|["']$/g, "").replace(/\s+#.*$/, "").trim();
    if (value === "") continue;
    if (m[1] === "review") out.review = value.toLowerCase();
    else out.approvedAt = value;
  }
  return out;
}

/**
 * Count the review items in one file's source. The cheap pre-check skips the
 * parser for the common case — most notes in a vault hold no braces at all.
 */
export function summarizeSource(source: string): FileSummary {
  const fm = readReviewFrontmatter(source);
  const base: FileSummary = { ...EMPTY_SUMMARY, reviewWhole: fm.review === "whole", approvedAt: fm.approvedAt };
  if (!source.includes("{")) return base;
  const parsed = parse(source);
  if (parsed.nodes.length === 0) return base;
  const anchored = anchorNodeIndexes(parsed);
  const onChange = changeThreads(parsed);
  const resolvedHl = resolvedHighlightIndexes(parsed);
  let suggestions = 0;
  let highlights = 0;
  parsed.nodes.forEach((n, i) => {
    if (isChangeNode(n)) suggestions++;
    else if (n.kind === "highlight" && !anchored.has(i) && !resolvedHl.has(i)) highlights++;
  });
  return {
    ...base,
    suggestions,
    comments: parsed.threads.length - onChange.size - resolvedThreadIndexes(parsed).size,
    highlights,
  };
}

/**
 * Files with the most to review first: suggestions outrank comments, which
 * outrank highlights; ties fall back to path order so the list is stable
 * across refreshes.
 */
export function sortRows(rows: FileRow[]): FileRow[] {
  return [...rows].sort(
    (a, b) =>
      Number(!!b.reviewWhole) - Number(!!a.reviewWhole) ||
      // Never-approved before dirty (approved, changed since).
      Number(!!a.approvedAt) - Number(!!b.approvedAt) ||
      b.suggestions - a.suggestions ||
      b.comments - a.comments ||
      b.highlights - a.highlights ||
      a.path.localeCompare(b.path),
  );
}

/** Case-insensitive substring match on the path; every space-separated term must match. */
export function filterRows(rows: FileRow[], query: string): FileRow[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return rows;
  return rows.filter((r) => {
    const p = r.path.toLowerCase();
    return terms.every((t) => p.includes(t));
  });
}

export interface Totals {
  files: number;
  /** Files flagged `review: whole`. */
  wholeReview: number;
  suggestions: number;
  comments: number;
  highlights: number;
}

export function totals(rows: FileRow[]): Totals {
  const out: Totals = { files: rows.length, wholeReview: 0, suggestions: 0, comments: 0, highlights: 0 };
  for (const r of rows) {
    if (r.reviewWhole) out.wholeReview++;
    out.suggestions += r.suggestions;
    out.comments += r.comments;
    out.highlights += r.highlights;
  }
  return out;
}

/** "3 suggestions · 1 comment · 2 highlights · 1 to read" (highlights and whole-review only when non-zero). */
export function describeSummary(s: { suggestions: number; comments: number; highlights: number; wholeReview?: number }): string {
  const parts = [
    `${s.suggestions} ${s.suggestions === 1 ? "suggestion" : "suggestions"}`,
    `${s.comments} ${s.comments === 1 ? "comment" : "comments"}`,
  ];
  if (s.highlights > 0) {
    parts.push(`${s.highlights} ${s.highlights === 1 ? "highlight" : "highlights"}`);
  }
  if (s.wholeReview) {
    parts.push(`${s.wholeReview} to read whole`);
  }
  return parts.join(" · ");
}
