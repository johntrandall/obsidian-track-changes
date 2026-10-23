// Document approval: the base text, its hash, and the anchor the panel's
// Approve button writes. Mirrors the agent tool's `base_text` / `text_hash`
// (design: claude-plugin-obsidian-track-changes-agent
// dev-docs/design/approval-anchor-and-drift.md, 2026-10-22). The shared
// vectors in test/fixtures/approval/ pin both implementations to the same
// bytes. Pure module except `textHash`, which uses WebCrypto.
//
// Known divergence: this parser leaves marks inside code blocks alone; the
// tool's parser does not. A document with CriticMarkup inside a code fence
// hashes differently on the two sides. Keep marks out of code.

import { parse, type CriticNode } from "./parser";
import { countReviewItems } from "./pending";

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;
const STATUS_LINE_RE = /\b(Status|Approved|approved|Accepted)\b/;

/** Body after the frontmatter block, or the whole text when there is none. */
export function stripFrontmatter(text: string): string {
  const m = FRONTMATTER_RE.exec(text);
  return m ? text.slice(m[0].length) : text;
}

/**
 * Remove the status blockquote that directly follows the first H1 (only
 * blank lines between) when its first line starts `> ` and names Status,
 * Approved or Accepted.
 */
export function stripStatusLine(body: string): string {
  const lines = body.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith("# ")) continue;
    let j = i + 1;
    while (j < lines.length && lines[j].trim() === "") j++;
    if (j < lines.length && lines[j].startsWith("> ") && STATUS_LINE_RE.test(lines[j])) {
      let k = j;
      while (k < lines.length && lines[k].startsWith(">")) k++;
      lines.splice(j, k - j);
    }
    break;
  }
  return lines.join("\n");
}

function resolved(n: CriticNode, accept: boolean): string {
  switch (n.kind) {
    case "addition":
      return accept ? n.text : "";
    case "deletion":
      return accept ? "" : n.text;
    case "substitution":
      return accept ? n.newText : n.oldText;
    case "comment":
      return "";
    case "highlight":
    case "aitext":
      return n.text;
  }
}

/**
 * The document as approved (every mark rejected) or, with `accept`, as
 * proposed (every mark accepted): no frontmatter, no status line, LF endings,
 * blank runs collapsed, trailing whitespace stripped, outer blank lines gone.
 */
export function baseText(text: string, accept = false): string {
  const body = stripStatusLine(stripFrontmatter(text));
  const parsed = parse(body);
  let out = "";
  let i = 0;
  for (const n of parsed.nodes) {
    out += body.slice(i, n.from) + resolved(n, accept);
    i = n.to;
  }
  out += body.slice(i);
  out = out.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  out = out.replace(/\n[ \t]*\n(?:[ \t]*\n)+/g, "\n\n");
  const lines = out.split("\n").map((l) => l.replace(/\s+$/, ""));
  while (lines.length && lines[0] === "") lines.shift();
  while (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines.join("\n");
}

/** `sha256:` plus the first 16 hex digits of the SHA-256 of the UTF-8 text. */
export async function textHash(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const hex = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
  return "sha256:" + hex.slice(0, 16);
}

/**
 * What keeps a note from being approved: pending suggestions, and comment
 * threads the user has not resolved. A resolved thread stays in the note as
 * the review's record and never blocks (defect 2026-10-23: Approve refused a
 * note whose only marks were resolved comments); an agent's `acknowledged=`
 * alone does not close a thread; highlights and AI text never block. The same
 * count as the panel header (`countReviewItems`); the agent tool's
 * `blocking_marks` agrees on zero.
 */
export function openReviewCounts(text: string): { suggestions: number; comments: number } {
  const c = countReviewItems(parse(stripFrontmatter(text)));
  return { suggestions: c.suggestions, comments: c.comments };
}

/** Suggestions plus unresolved comment threads; 0 means the note may be approved. */
export function openMarkCount(text: string): number {
  const c = openReviewCounts(text);
  return c.suggestions + c.comments;
}

/**
 * The anchor the Approve button writes. `approved_sha` is `pending`: the
 * commit holding this text does not exist yet when the human clicks; the
 * agent tool's `approve --fill-sha` (or watchbill's sweep) completes it.
 */
export interface ApprovalAnchor {
  status: "accepted";
  approved_by: string;
  approved_at: string;
  approved_via: string;
  approved_sha: "pending";
  approved_hash: string;
  approved_whole_sha: "pending";
}

/** Local time with seconds and a numeric offset, e.g. 2026-10-22T13:20:00-04:00. */
export function approvalStamp(now: Date = new Date()): string {
  const pad = (n: number): string => String(n).padStart(2, "0");
  const off = -now.getTimezoneOffset();
  const sign = off >= 0 ? "+" : "-";
  const oh = pad(Math.floor(Math.abs(off) / 60));
  const om = pad(Math.abs(off) % 60);
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
    `T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}${sign}${oh}:${om}`
  );
}

export async function buildAnchor(text: string, by: string, via: string, now?: Date): Promise<ApprovalAnchor> {
  return {
    status: "accepted",
    approved_by: by || "You",
    approved_at: approvalStamp(now),
    approved_via: via,
    approved_sha: "pending",
    approved_hash: await textHash(baseText(text)),
    approved_whole_sha: "pending",
  };
}

/** The approval anchor as read back from a note's frontmatter (top-level keys only; quotes and `# comments` dropped). */
export interface ApprovalRead {
  approvedBy: string | null;
  approvedAt: string | null;
  approvedHash: string | null;
  approvedSha: string | null;
  review: string | null;
}

export function readApprovalFrontmatter(text: string): ApprovalRead {
  const out: ApprovalRead = { approvedBy: null, approvedAt: null, approvedHash: null, approvedSha: null, review: null };
  const m = FRONTMATTER_RE.exec(text);
  if (!m) return out;
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^(approved_by|approved_at|approved_hash|approved_sha|review):[ \t]*(.*?)[ \t]*$/.exec(line);
    if (!kv) continue;
    const value = kv[2].replace(/\s+#.*$/, "").replace(/^["']|["']$/g, "").trim();
    if (value === "") continue;
    if (kv[1] === "approved_by") out.approvedBy = value;
    else if (kv[1] === "approved_at") out.approvedAt = value;
    else if (kv[1] === "approved_hash") out.approvedHash = value;
    else if (kv[1] === "approved_sha") out.approvedSha = value;
    else out.review = value.toLowerCase();
  }
  return out;
}

/**
 * The note's approval state, the same names and order as the agent tool's
 * `drift` (watchbill's request of 2026-10-23: a persistent indicator):
 * `unapproved` (no anchor), `needs-review` (`review: whole` is set),
 * `dirty` (the base text no longer hashes to `approved_hash`), `delta-open`
 * (unchanged, but suggestions or unresolved comments are open since), `clean`.
 * Reads only; writes nothing.
 */
export type ApprovalStateName = "unapproved" | "needs-review" | "dirty" | "delta-open" | "clean";

export interface ApprovalState extends ApprovalRead {
  state: ApprovalStateName;
  openMarks: number;
}

export async function approvalState(text: string): Promise<ApprovalState> {
  const a = readApprovalFrontmatter(text);
  const openMarks = openMarkCount(text);
  let state: ApprovalStateName;
  if (!a.approvedHash) state = "unapproved";
  else if (a.review === "whole") state = "needs-review";
  else if ((await textHash(baseText(text))) !== a.approvedHash) state = "dirty";
  else if (openMarks > 0) state = "delta-open";
  else state = "clean";
  return { ...a, state, openMarks };
}

/** "2026-10-23T15:42:51-04:00" → "2026-10-23 15:42"; anything else unchanged. */
function shortStamp(s: string): string {
  const m = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/.exec(s);
  return m ? `${m[1]} ${m[2]}` : s;
}

/** The panel's one-line indicator, or null when the note carries no approval. */
export function describeApproval(s: ApprovalState): string | null {
  if (s.state === "unapproved") return null;
  const when = s.approvedAt ? shortStamp(s.approvedAt) : "at an unknown time";
  const who = s.approvedBy ? ` by ${s.approvedBy}` : "";
  const uncommitted = s.approvedSha === "pending" ? " · not yet committed" : "";
  switch (s.state) {
    case "clean":
      return `Approved ${when}${who} · unchanged since${uncommitted}`;
    case "delta-open":
      return `Approved ${when}${who} · unchanged, ${s.openMarks} open since${uncommitted}`;
    case "dirty":
      return `Changed since approval (${when}${who})`;
    case "needs-review":
      return `Last approved ${when}${who} · flagged for review`;
  }
}
