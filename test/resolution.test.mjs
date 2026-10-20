import { strict as assert } from "node:assert";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { build } from "esbuild";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function loadTs(rel) {
  const out = await build({
    entryPoints: [resolve(__dirname, rel)],
    bundle: true,
    format: "esm",
    target: "es2018",
    write: false,
    platform: "neutral",
  });
  const code = out.outputFiles[0].text;
  return await import("data:text/javascript;base64," + Buffer.from(code).toString("base64"));
}

const { parse } = await loadTs("../src/parser.ts");
const {
  threadStatus,
  isResolved,
  resolvedThreadIndexes,
  setPrefixAttrs,
  resolveThread,
  reopenThread,
  clearStatus,
  sanitizeMetaValue,
} = await loadTs("../src/resolution.ts");
const { applyEdits, rebaseEdits, replyEdits, editsAtCursor } = await loadTs("../src/operations.ts");
const { summarizeSource } = await loadTs("../src/pending.ts");

let failed = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  ok  - ${name}`);
  } catch (e) {
    failed++;
    console.log(`  FAIL - ${name}`);
    console.log(e);
  }
}

// ---- reading the flags ----

test("a bare thread carries no status", () => {
  const r = parse("x {>>note<<} y");
  assert.deepEqual(threadStatus(r, r.threads[0]), {
    resolved: null,
    acknowledged: null,
    acknowledgedBy: null,
  });
  assert.equal(isResolved(r, r.threads[0]), false);
});

test("resolved= and acknowledged= are read from the root, independently", () => {
  const r = parse(
    'x {author="Claude" date="2026-10-19" resolved="2026-10-20" acknowledged="2026-10-21" acknowledged-by="Claude">>note<<}{>>reply<<} y',
  );
  assert.deepEqual(threadStatus(r, r.threads[0]), {
    resolved: "2026-10-20",
    acknowledged: "2026-10-21",
    acknowledgedBy: "Claude",
  });
  assert.equal(isResolved(r, r.threads[0]), true);
  // Existing attribution is untouched by the flags.
  assert.equal(r.nodes[0].metaAuthor, "Claude");
  assert.equal(r.nodes[0].text, "note");
});

test("acknowledged alone is not resolved: the user still has it in the queue", () => {
  const r = parse('{acknowledged="2026-10-20" acknowledged-by="Claude">>note<<}');
  assert.equal(isResolved(r, r.threads[0]), false);
  assert.equal(summarizeSource('{acknowledged="2026-10-20">>note<<}').comments, 1);
});

test("flags on a reply do not resolve the thread; only the root counts", () => {
  const r = parse('{>>root<<}{resolved="2026-10-20">>reply<<}');
  assert.equal(isResolved(r, r.threads[0]), false);
});

test("a thread anchored on a suggestion is never resolved: the suggestion is pending", () => {
  const r = parse('{++new++}{resolved="2026-10-20">>why<<}');
  assert.equal(isResolved(r, r.threads[0]), false);
  assert.deepEqual(summarizeSource('{++new++}{resolved="2026-10-20">>why<<}'), {
    suggestions: 1,
    comments: 0,
    highlights: 0,
  });
});

test("pending counts skip resolved threads but keep the rest", () => {
  const src = 'a {resolved="2026-10-20">>done<<} b {>>open<<} c {==hl==}';
  assert.deepEqual(summarizeSource(src), { suggestions: 0, comments: 1, highlights: 1 });
  const r = parse(src);
  assert.deepEqual([...resolvedThreadIndexes(r)], [0]);
});

test("a resolved thread's highlight anchor stays folded into the thread", () => {
  assert.deepEqual(summarizeSource('{==text==}{resolved="2026-10-20">>done<<}'), {
    suggestions: 0,
    comments: 0,
    highlights: 0,
  });
});

// ---- writing the flags ----

test("resolveThread adds resolved= to a prefix-free root", () => {
  const src = "x {>>note<<}{>>reply<<} y";
  const r = parse(src);
  const edit = resolveThread(src, r, r.threads[0], "2026-10-20");
  const out = applyEdits(src, [edit]);
  assert.equal(out, 'x {resolved="2026-10-20">>note<<}{>>reply<<} y');
  assert.equal(isResolved(parse(out), parse(out).threads[0]), true);
});

test("resolveThread appends to an existing prefix and keeps every other pair", () => {
  const src = '{author="Claude" date="2026-10-19">>note<<}';
  const r = parse(src);
  const out = applyEdits(src, [resolveThread(src, r, r.threads[0], "2026-10-20")]);
  assert.equal(out, '{author="Claude" date="2026-10-19" resolved="2026-10-20">>note<<}');
});

test("resolveThread on an already resolved thread is a no-op (null)", () => {
  const src = '{resolved="2026-10-20">>note<<}';
  const r = parse(src);
  assert.equal(resolveThread(src, r, r.threads[0], "2026-10-20"), null);
  // A different stamp rewrites it.
  assert.equal(
    applyEdits(src, [resolveThread(src, r, r.threads[0], "2026-10-21")]),
    '{resolved="2026-10-21">>note<<}',
  );
});

test("reopenThread removes resolved= and leaves the agent's acknowledgement", () => {
  const src = '{author="Claude" resolved="2026-10-20" acknowledged="2026-10-20" acknowledged-by="Claude">>note<<}';
  const r = parse(src);
  const out = applyEdits(src, [reopenThread(src, r, r.threads[0])]);
  assert.equal(out, '{author="Claude" acknowledged="2026-10-20" acknowledged-by="Claude">>note<<}');
  assert.equal(reopenThread(out, parse(out), parse(out).threads[0]), null);
});

test("reopening a thread whose only pair was resolved= leaves a clean prefix-free mark", () => {
  const src = 'a {resolved="2026-10-20">>note<<} b';
  const r = parse(src);
  assert.equal(applyEdits(src, [reopenThread(src, r, r.threads[0])]), "a {>>note<<} b");
});

test("clearStatus drops both flags and the by-name, nothing else", () => {
  const src = '{date="2026-10-19" resolved="2026-10-20" acknowledged="x" acknowledged-by="Claude" author="Claude">>note<<}';
  const r = parse(src);
  assert.equal(
    applyEdits(src, [clearStatus(src, r, r.threads[0])]),
    '{date="2026-10-19" author="Claude">>note<<}',
  );
  assert.equal(clearStatus("{>>a<<}", parse("{>>a<<}"), parse("{>>a<<}").threads[0]), null);
});

test("setPrefixAttrs normalises duplicate and mixed-case keys the way the parser reads them", () => {
  const src = '{Author="A" author="B" date="d">>note<<}';
  const r = parse(src);
  const out = applyEdits(src, [setPrefixAttrs(src, r.nodes[0], { status: "x" })]);
  assert.equal(out, '{author="A" date="d" status="x">>note<<}');
});

test("values are sanitised so they can never break the prefix", () => {
  assert.equal(sanitizeMetaValue(' a"b{c}d\ne '), "abcde");
  const src = "{>>note<<}";
  const r = parse(src);
  const out = applyEdits(src, [setPrefixAttrs(src, r.nodes[0], { resolved: 'x"}{y' })]);
  assert.equal(out, '{resolved="xy">>note<<}');
  // A value that sanitises to nothing is not written.
  assert.equal(setPrefixAttrs(src, r.nodes[0], { resolved: '"{}' }), null);
});

// ---- rebase safety ----

test("a resolve edit rebases when text was inserted ahead of the thread", () => {
  const src = "intro {>>note<<} tail";
  const r = parse(src);
  const edit = resolveThread(src, r, r.threads[0], "2026-10-20");
  const drifted = "a new sentence. " + src;
  const { edits, dropped } = rebaseEdits(drifted, [edit]);
  assert.equal(dropped, 0);
  assert.equal(applyEdits(drifted, edits), 'a new sentence. intro {resolved="2026-10-20">>note<<} tail');
});

test("a resolve edit on a prefix-free root fails closed instead of landing on another mark", () => {
  const src = "{>>one<<} and {>>two<<}";
  const r = parse(src);
  const edit = resolveThread(src, r, r.threads[1], "2026-10-20");
  // The second thread moved and the prose ahead of it changed, so the context
  // anchor no longer matches: the edit is dropped. Without `before`, an
  // empty-range edit would have matched the stale offset trivially and
  // inserted into whatever sits there now.
  const drifted = "{>>one<<} and more and {>>two<<}";
  assert.equal(rebaseEdits(drifted, [edit]).dropped, 1);
  // Shifted so the original offset no longer verifies, and the context now
  // occurs twice: ambiguous, dropped.
  const ambiguous = "X {>>one<<} and {>>two<<} {>>one<<} and {>>two<<}";
  assert.equal(rebaseEdits(ambiguous, [edit]).dropped, 1);
  // Unchanged context ahead of the thread relocates it.
  const shifted = "{>>one<<} and {>>two<<} trailing text";
  const { edits, dropped } = rebaseEdits(shifted, [edit]);
  assert.equal(dropped, 0);
  assert.equal(applyEdits(shifted, edits), '{>>one<<} and {resolved="2026-10-20">>two<<} trailing text');
});

// ---- replies reopen ----

test("a reply clears both flags: the thread is live again for everyone", () => {
  const src = 'x {author="Claude" resolved="2026-10-20" acknowledged="2026-10-20" acknowledged-by="Claude">>note<<} y';
  const r = parse(src);
  const edits = replyEdits(src, r.threads[0], r, "actually…", "John", "date");
  assert.equal(edits.length, 2);
  const out = applyEdits(src, edits);
  assert.match(out, /^x \{author="Claude">>note<<\}\{author="John" date="\d{4}-\d{2}-\d{2}">>actually…<<\} y$/);
  const r2 = parse(out);
  assert.equal(r2.threads.length, 1);
  assert.equal(r2.threads[0].replyIndexes.length, 1);
  assert.equal(isResolved(r2, r2.threads[0]), false);
});

test("a reply on an unflagged thread is the single insert it always was", () => {
  const src = "{>>note<<}";
  const r = parse(src);
  assert.equal(replyEdits(src, r.threads[0], r, "ok").length, 1);
});

// ---- cursor commands ----

test("resolve-thread / reopen-thread at the cursor mirror the panel", () => {
  const src = "x {>>note<<} y";
  const r = parse(src);
  const edits = editsAtCursor(src, r, 4, "resolve-thread", "2026-10-20");
  assert.ok(Array.isArray(edits));
  const out = applyEdits(src, edits);
  assert.equal(out, 'x {resolved="2026-10-20">>note<<} y');
  const r2 = parse(out);
  assert.equal(editsAtCursor(out, r2, 4, "resolve-thread", "2026-10-20"), "This thread is already resolved.");
  assert.equal(applyEdits(out, editsAtCursor(out, r2, 4, "reopen-thread")), src);
  assert.equal(editsAtCursor(src, r, 4, "reopen-thread"), "This thread is not resolved.");
  assert.equal(editsAtCursor(src, r, 0, "resolve-thread", "2026-10-20"), "No comment or highlight at cursor.");
});

test("resolve-thread refuses a thread anchored on a suggestion", () => {
  const src = "{++new++}{>>why<<}";
  const r = parse(src);
  assert.equal(
    editsAtCursor(src, r, 12, "resolve-thread", "2026-10-20"),
    "This thread belongs to a suggestion; accept or reject the suggestion instead.",
  );
});

// ---- resolved highlights ----

const { isResolvedHighlight, resolvedHighlightIndexes, resolveHighlight, reopenHighlight } =
  await loadTs("../src/resolution.ts");

test("a lone highlight with resolved= is resolved; an anchor never is", () => {
  const src = 'a {resolved="2026-10-20"==lone==} b {resolved="2026-10-20"==anchor==}{>>c<<} d {==open==}';
  const r = parse(src);
  assert.equal(isResolvedHighlight(r, 0), true);
  assert.equal(isResolvedHighlight(r, 1), false);
  assert.equal(isResolvedHighlight(r, 3), false);
  assert.deepEqual([...resolvedHighlightIndexes(r)], [0]);
  assert.deepEqual(summarizeSource(src), { suggestions: 0, comments: 1, highlights: 1 });
});

test("resolveHighlight / reopenHighlight write and clear the flag", () => {
  const src = "x {==hl==} y";
  const r = parse(src);
  const out = applyEdits(src, [resolveHighlight(src, r.nodes[0], "2026-10-20")]);
  assert.equal(out, 'x {resolved="2026-10-20"==hl==} y');
  const r2 = parse(out);
  assert.equal(applyEdits(out, [reopenHighlight(out, r2.nodes[0])]), src);
  assert.equal(reopenHighlight(src, r.nodes[0]), null);
});

test("cursor resolve/reopen work on a lone highlight and refuse an anchor", () => {
  const src = "x {==hl==} y {==a==}{>>c<<}";
  const r = parse(src);
  const out = applyEdits(src, editsAtCursor(src, r, 4, "resolve-thread", "2026-10-20"));
  assert.equal(out, 'x {resolved="2026-10-20"==hl==} y {==a==}{>>c<<}');
  assert.equal(editsAtCursor(out, parse(out), 4, "resolve-thread", "2026-10-20"), "This highlight is already resolved.");
  assert.equal(applyEdits(out, editsAtCursor(out, parse(out), 4, "reopen-thread")), src);
  assert.equal(editsAtCursor(src, r, 15, "resolve-thread", "2026-10-20"), "This highlight belongs to a comment thread; resolve the thread.");
  assert.equal(editsAtCursor(src, r, 0, "resolve-thread", "2026-10-20"), "No comment or highlight at cursor.");
});

if (failed > 0) {
  console.log(`resolution.test.mjs: ${failed} failed`);
  process.exit(1);
}
console.log("resolution.test.mjs: ok");
