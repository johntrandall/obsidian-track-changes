// Pure helpers for showing suggestions inside a Live Preview table cell.
//
// Obsidian draws a table in Live Preview as a CodeMirror widget and renders
// each cell through the markdown post-processors, the same path as reading
// view, so the CodeMirror decorations that show suggestions never see a cell.
// `reading.ts` renders such a cell in suggestion form instead of accepted form;
// this module holds the parts that need no DOM: the "is this a Live Preview
// table cell" test, parsing one mark as it appears in the cell's text, finding
// that mark's source offset in the note, and the attributes a rendered mark
// carries. No `obsidian` import, so the Node tests load it directly.

import { parse, type CriticNode, type ParseResult } from "./parser";
import { authorHueIndex } from "./authors";

/** The bits of an element this module reads (a real HTMLElement satisfies it). */
export interface ClassListLike {
  classList?: { contains(token: string): boolean } | null;
  closest?: (selector: string) => unknown;
}

/**
 * Whether a post-processor call is rendering one cell of a Live Preview table.
 *
 * Observed in the test vault (2026-10-30): for a table in Live Preview,
 * Obsidian calls the post-processors once per cell with `el` a detached
 * `div.table-cell-wrapper`, `ctx.getSectionInfo(el)` null, and the (undocumented)
 * `ctx.containerEl` the table widget, `div.cm-embed-block.cm-table-widget`.
 * Reading view never hands a `.cm-` container, so this one test is where the
 * two paths split: a Live Preview cell gets suggestion form, everything else
 * keeps the accepted (publish preview) form. The `closest` check covers a cell
 * that is already attached when it is processed.
 */
export function isLivePreviewTableCell(el: ClassListLike, containerEl: ClassListLike | null | undefined): boolean {
  if (containerEl?.classList?.contains("cm-table-widget")) return true;
  try {
    return !!el.closest?.(".cm-table-widget");
  } catch {
    return false;
  }
}

/**
 * Undo markdown backslash escapes (`\|` to `|`, `\*` to `*`): a cell's rendered
 * text has them undone, the source keeps them, so both sides are compared
 * without them.
 */
export function unescapeMarkdown(s: string): string {
  return normalizeBreaks(s.replace(/\\([!-/:-@[-`{-~])/g, "$1"));
}

/**
 * A table cell cannot hold a real newline, so a line break inside a cell is
 * written `<br>`. The cell's DOM has a `<br>` element there; the renderer reads
 * it back as the literal `<br>`, and the source's `<br/>` / `<br />` spellings
 * are folded to the same form so the two compare equal.
 */
export function normalizeBreaks(s: string): string {
  return s.replace(/<br\s*\/?>/gi, "<br>");
}

/** Split text at `<br>` into the pieces between breaks (one piece when there is none). */
export function splitBreaks(s: string): string[] {
  return normalizeBreaks(s).split("<br>");
}

/**
 * Parse one mark exactly as it reads in a cell's rendered text (prefix
 * included). Null unless the string is a single mark from end to end.
 */
export function parseLiteralMark(raw: string): CriticNode | null {
  const p = parse(raw, { skipCode: false });
  if (p.nodes.length !== 1) return null;
  const n = p.nodes[0];
  return n.from === 0 && n.to === raw.length ? n : null;
}

/**
 * The source offset the review panel keys this mark's card by (a comment maps
 * to its thread's start, as the inline chips do), when exactly one mark in the
 * note reads `cellRaw` once escapes are undone. Null when none or several do:
 * a click must never open the wrong card.
 */
export function resolveCellMarkOffset(parsed: ParseResult, cellRaw: string): number | null {
  let hit = -1;
  for (let i = 0; i < parsed.nodes.length; i++) {
    if (unescapeMarkdown(parsed.nodes[i].raw) !== cellRaw) continue;
    if (hit >= 0) return null;
    hit = i;
  }
  if (hit < 0) return null;
  const node = parsed.nodes[hit];
  if (node.kind === "comment") {
    const ti = parsed.nodeThread[hit];
    if (ti >= 0) return parsed.threads[ti].from;
  }
  return node.from;
}

/** The parsed node at `offset` (a change, highlight or comment start), or -1. */
export function nodeIndexAt(parsed: ParseResult, offset: number): number {
  return parsed.nodes.findIndex((n) => n.from === offset);
}

/**
 * Attributes for a rendered mark, matching the editor decorations: a `title`
 * of "author · date", `data-author-hue` for a named author, `data-tc-offset`
 * when the offset is known, and `data-tc-mark` (the mark's cell text) so a
 * click re-resolves the offset against the note as it is then.
 */
export function cellMarkAttrs(
  node: CriticNode,
  cellRaw: string,
  offset: number | null,
  localAuthorName: string,
): Record<string, string> {
  const legacy = node.kind === "comment" ? node.authorName : null;
  const local = localAuthorName.trim();
  const named = node.metaAuthor ?? legacy ?? (local !== "" ? local : null);
  const label = named ?? "You";
  const attrs: Record<string, string> = {
    title: node.metaDate ? `${label} · ${node.metaDate}` : label,
  };
  if (named && node.kind !== "aitext") attrs["data-author-hue"] = String(authorHueIndex(named));
  // AI text is visual-only: no panel card, so no offset and no click.
  if (node.kind !== "aitext") {
    attrs["data-tc-mark"] = cellRaw;
    if (offset !== null) attrs["data-tc-offset"] = String(offset);
  }
  return attrs;
}
