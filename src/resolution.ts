// Thread resolution flags: two independent "done" states carried as metadata
// on a thread's root comment, so a processed comment stays in the note (for
// the record, and for whoever has not processed it yet) without staying in
// anyone's queue.
//
//   resolved="<stamp>"                       the user has dealt with the thread
//   acknowledged="<stamp>" acknowledged-by="<name>"
//                                            an agent has received and processed it
//
// The two are deliberately separate: the plugin writes `resolved` and filters
// on it (the panel hides resolved threads, the counts skip them); an agent
// writes `acknowledged` and filters on that. Either side can see the other's
// flag. A reply from anyone clears both — the thread is live again.
//
// Nothing in the CriticMarkup grammar changes: the flags are ordinary pairs in
// the metadata prefix, which every mark already carries, and the parser already
// surfaces unknown keys. A plugin version that predates the flags shows the
// thread as pending, nothing worse. Pure module — no Obsidian imports.

import type { CommentNode, ParseResult, Thread, CriticNode } from "./parser";
import type { SourceEdit } from "./operations";

export const RESOLVED_KEY = "resolved";
export const ACKNOWLEDGED_KEY = "acknowledged";
export const ACKNOWLEDGED_BY_KEY = "acknowledged-by";

export interface ThreadStatus {
  /** The `resolved=` stamp on the root, or null: the user is done with it. */
  resolved: string | null;
  /** The `acknowledged=` stamp on the root, or null: an agent has processed it. */
  acknowledged: string | null;
  /** The `acknowledged-by=` name, or null. Display-only. */
  acknowledgedBy: string | null;
}

export function threadRoot(parsed: ParseResult, thread: Thread): CommentNode {
  return parsed.nodes[thread.rootIndex] as CommentNode;
}

export function threadStatus(parsed: ParseResult, thread: Thread): ThreadStatus {
  const attrs = threadRoot(parsed, thread).metaAttrs;
  return {
    resolved: attrs[RESOLVED_KEY] ?? null,
    acknowledged: attrs[ACKNOWLEDGED_KEY] ?? null,
    acknowledgedBy: attrs[ACKNOWLEDGED_BY_KEY] ?? null,
  };
}

/** True when the user has resolved the thread. Change-anchored threads never count as resolved: the suggestion is still pending. */
export function isResolved(parsed: ParseResult, thread: Thread): boolean {
  return thread.changeIndex === null && RESOLVED_KEY in threadRoot(parsed, thread).metaAttrs;
}

/** Thread indexes the user has resolved (see `isResolved`). */
export function resolvedThreadIndexes(parsed: ParseResult): Set<number> {
  const out = new Set<number>();
  parsed.threads.forEach((t, i) => {
    if (isResolved(parsed, t)) out.add(i);
  });
  return out;
}

const PAIR_RE = /([A-Za-z][\w-]*)="([^"{}\n]*)"/g;
const PREFIX_ANCHOR_CONTEXT = 40;

/**
 * Strip what the quoted value class forbids (`"`, `{`, `}`, newline) plus
 * control characters, so a value can never break the prefix it sits in.
 */
export function sanitizeMetaValue(value: string): string {
  return value
    // eslint-disable-next-line no-control-regex -- stripping control chars is the point
    .replace(/[\x00-\x1f\x7f\u2028\u2029]/g, "")
    .replace(/["{}]/g, "")
    .trim();
}

/**
 * Rewrite a mark's metadata prefix: keys in `patch` are set (string) or
 * removed (null); every other pair keeps its place and value. Keys are
 * lowercased, duplicates collapse to the first occurrence (the parser's
 * rule), and the pairs are re-joined with single spaces. Returns null when the
 * prefix would not change.
 *
 * The edit replaces exactly the prefix text after the opening brace. `before`
 * carries context plus the brace so an empty prefix (an insertion) still
 * anchors under rebase instead of matching trivially at a stale offset.
 */
export function setPrefixAttrs(
  source: string,
  node: CriticNode,
  patch: Record<string, string | null>,
): SourceEdit | null {
  const pairs: Array<[string, string]> = [];
  const seen = new Set<string>();
  for (const m of node.metaRaw.matchAll(PAIR_RE)) {
    const key = m[1].toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    pairs.push([key, m[2]]);
  }
  let changed = false;
  for (const [rawKey, value] of Object.entries(patch)) {
    const key = rawKey.toLowerCase();
    const at = pairs.findIndex(([k]) => k === key);
    if (value === null) {
      if (at !== -1) {
        pairs.splice(at, 1);
        changed = true;
      }
      continue;
    }
    const clean = sanitizeMetaValue(value);
    if (clean === "") continue;
    if (at === -1) {
      pairs.push([key, clean]);
      changed = true;
    } else if (pairs[at][1] !== clean) {
      pairs[at][1] = clean;
      changed = true;
    }
  }
  if (!changed) return null;
  const prefix = pairs.map(([k, v]) => `${k}="${v}"`).join(" ");
  const from = node.from + 1;
  const to = from + node.metaRaw.length;
  return {
    from,
    to,
    insert: prefix,
    expected: source.slice(from, to),
    before: source.slice(Math.max(0, node.from - PREFIX_ANCHOR_CONTEXT), from),
  };
}

/** Mark the thread resolved for the user: `resolved="<stamp>"` on its root. */
export function resolveThread(
  source: string,
  parsed: ParseResult,
  thread: Thread,
  stamp: string,
): SourceEdit | null {
  return setPrefixAttrs(source, threadRoot(parsed, thread), { [RESOLVED_KEY]: stamp });
}

/** Clear the user's `resolved` flag. The agent's acknowledgement stays: it records a fact. */
export function reopenThread(source: string, parsed: ParseResult, thread: Thread): SourceEdit | null {
  return setPrefixAttrs(source, threadRoot(parsed, thread), { [RESOLVED_KEY]: null });
}

/**
 * The edit that reopens a thread for everyone — what a new reply implies.
 * Null when neither flag is set.
 */
export function clearStatus(source: string, parsed: ParseResult, thread: Thread): SourceEdit | null {
  return setPrefixAttrs(source, threadRoot(parsed, thread), {
    [RESOLVED_KEY]: null,
    [ACKNOWLEDGED_KEY]: null,
    [ACKNOWLEDGED_BY_KEY]: null,
  });
}
