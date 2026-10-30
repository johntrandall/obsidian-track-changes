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

import { anchorNodeIndexes, changeThreads, isChangeNode, parse, type ParseResult } from "./parser";
import { resolvedHighlightIndexes, resolvedThreadIndexes } from "./resolution";

export interface FileSummary {
  /**
   * Frontmatter `track_changes: ignore` (watchbill's request, 2026-10-30):
   * the note's marks are data, not review work. Every count is zero, so the
   * vault index keeps no row and nothing in the plugin acts on its marks.
   * Wins over `review: whole`.
   */
  ignored?: boolean;
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
  ignored: false,
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

/** What the review keys in a note's frontmatter say. */
export interface ReviewFrontmatter {
  /** `review:` lowercased, or null. */
  review: string | null;
  /** `approved_at:` as written, or null. */
  approvedAt: string | null;
  /** True when `track_changes:` is `ignore` (any case): the note's marks are data, not review items. */
  ignore: boolean;
}

/**
 * One frontmatter scalar: a quoted value up to its closing quote, otherwise
 * the text before a ` #` comment; surrounding quotes and whitespace dropped.
 */
function frontmatterScalar(raw: string): string {
  const q = raw[0];
  if (q === '"' || q === "'") {
    const close = raw.indexOf(q, 1);
    if (close !== -1) return raw.slice(1, close).trim();
  }
  return raw.replace(/(^|\s)#.*$/, "").replace(/^["']|["']$/g, "").trim();
}

/**
 * The review keys from a leading YAML frontmatter block, read with a plain
 * scan (top-level `key: value` lines only) so the index never waits on
 * Obsidian's metadata cache. Values may be quoted and carry a trailing
 * `# comment`; `review` is lowercased; `track_changes` matches `ignore` in
 * any case, and any other value means a normal note.
 */
export function readReviewFrontmatter(source: string): ReviewFrontmatter {
  const out: ReviewFrontmatter = { review: null, approvedAt: null, ignore: false };
  if (!source.startsWith("---")) return out;
  const end = source.indexOf("\n---", 3);
  if (end === -1) return out;
  const block = source.slice(3, end);
  for (const line of block.split(/\r?\n/)) {
    const m = /^(review|approved_at|track_changes):[ \t]*(.*?)[ \t\r]*$/.exec(line);
    if (!m) continue;
    const value = frontmatterScalar(m[2]);
    if (value === "") continue;
    if (m[1] === "review") out.review = value.toLowerCase();
    else if (m[1] === "approved_at") out.approvedAt = value;
    else out.ignore = value.toLowerCase() === "ignore";
  }
  return out;
}

/** True when the note's frontmatter says `track_changes: ignore`. */
export function isIgnored(source: string): boolean {
  return readReviewFrontmatter(source).ignore;
}

/** The review panel's one line for an ignored note. */
export const IGNORED_PANEL_TEXT =
  "Ignored: this note's front matter says `track_changes: ignore`, so its marks are data, not review items. Remove the line to review them.";

/**
 * The one guard every mark-changing path calls: the Notice text refusing the
 * action on an ignored note, or null when the note is a normal one.
 */
export function ignoreRefusal(source: string): string | null {
  if (!isIgnored(source)) return null;
  return "Refused: this note's front matter says track_changes: ignore, so its marks are data, not review items. Remove the line to act on them.";
}

/**
 * Count the review items in one file's source. The cheap pre-check skips the
 * parser for the common case — most notes in a vault hold no braces at all.
 */
export function summarizeSource(source: string): FileSummary {
  const fm = readReviewFrontmatter(source);
  // Ignore wins over everything: no counts, no whole-review flag, so the
  // vault index keeps no row for the note.
  if (fm.ignore) return { ...EMPTY_SUMMARY, ignored: true };
  const base: FileSummary = { ...EMPTY_SUMMARY, reviewWhole: fm.review === "whole", approvedAt: fm.approvedAt };
  if (!source.includes("{")) return base;
  const parsed = parse(source);
  if (parsed.nodes.length === 0) return base;
  const c = countReviewItems(parsed);
  return { ...base, suggestions: c.suggestions, comments: c.comments, highlights: c.highlights };
}

/** The review counts of one parsed note: what the review panel header shows and the overview row counts. */
export interface ReviewCounts {
  suggestions: number;
  /** Threads not anchored on a suggestion and not resolved by the user. */
  comments: number;
  /** Highlights that are not a thread's anchor and not resolved by the user. */
  highlights: number;
  /** Threads the user resolved (never change-anchored ones). */
  resolvedThreads: number;
  /** Lone highlights the user resolved. */
  resolvedHighlights: number;
}

/**
 * One definition of the counts for the panel header and the overview, so the
 * two cannot disagree (the header once subtracted resolved highlights from
 * the comment count; found by the mobile smoke, 2026-10-23).
 */
export function countReviewItems(parsed: ParseResult): ReviewCounts {
  const anchored = anchorNodeIndexes(parsed);
  const onChange = changeThreads(parsed);
  const resolvedHl = resolvedHighlightIndexes(parsed);
  const resolvedTh = resolvedThreadIndexes(parsed);
  let suggestions = 0;
  let highlights = 0;
  parsed.nodes.forEach((n, i) => {
    if (isChangeNode(n)) suggestions++;
    else if (n.kind === "highlight" && !anchored.has(i) && !resolvedHl.has(i)) highlights++;
  });
  return {
    suggestions,
    comments: parsed.threads.length - onChange.size - resolvedTh.size,
    highlights,
    resolvedThreads: resolvedTh.size,
    resolvedHighlights: resolvedHl.size,
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
