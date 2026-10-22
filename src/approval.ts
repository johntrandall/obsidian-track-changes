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

/** Suggestions and comments awaiting a decision; highlights and AI text are not. */
export function openMarkCount(text: string): number {
  return parse(stripFrontmatter(text)).nodes.filter(
    (n) => n.kind !== "highlight" && n.kind !== "aitext",
  ).length;
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
