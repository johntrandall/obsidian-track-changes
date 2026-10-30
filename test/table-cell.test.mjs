// Unit tests for the pure Live Preview table-cell helpers (src/table-cell.ts).
// Run with: node test/table-cell.test.mjs
//
// The DOM half (reading.ts renderTableCell) is checked by eye in the test vault
// (test/vault/table.md.fixture); this covers detection, parsing a mark as it
// reads in a cell, the offset match, and the attributes a rendered mark carries.

import { strict as assert } from "node:assert";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { build } from "esbuild";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function loadModule(srcPath) {
  const out = await build({
    entryPoints: [resolve(__dirname, srcPath)],
    bundle: true,
    format: "esm",
    target: "es2018",
    write: false,
    platform: "neutral",
  });
  const code = out.outputFiles[0].text;
  return import("data:text/javascript;base64," + Buffer.from(code).toString("base64"));
}

const { parse } = await loadModule("../src/parser.ts");
const {
  isLivePreviewTableCell,
  unescapeMarkdown,
  normalizeBreaks,
  splitBreaks,
  parseLiteralMark,
  resolveCellMarkOffset,
  cellMarkAttrs,
} = await loadModule("../src/table-cell.ts");

function test(name, fn) {
  try {
    fn();
    console.log("  ok  -", name);
  } catch (err) {
    console.error("  FAIL -", name);
    console.error(err);
    process.exitCode = 1;
  }
}

const classes = (...names) => ({ classList: { contains: (t) => names.includes(t) } });

console.log("table-cell:");

test("detection: a container that is the Live Preview table widget", () => {
  assert.equal(isLivePreviewTableCell({}, classes("cm-embed-block", "cm-table-widget", "markdown-rendered")), true);
});

test("detection: reading view (no container, or a preview container) is not a cell", () => {
  assert.equal(isLivePreviewTableCell({}, null), false);
  assert.equal(isLivePreviewTableCell({}, undefined), false);
  assert.equal(isLivePreviewTableCell({}, classes("markdown-preview-section")), false);
  assert.equal(isLivePreviewTableCell({ closest: () => null }, classes("markdown-rendered")), false);
});

test("detection: an attached cell inside the widget", () => {
  const el = { closest: (sel) => (sel === ".cm-table-widget" ? {} : null) };
  assert.equal(isLivePreviewTableCell(el, null), true);
});

test("unescapeMarkdown undoes backslash escapes and folds <br> spellings", () => {
  assert.equal(unescapeMarkdown("a \\| b"), "a | b");
  assert.equal(unescapeMarkdown("\\*x\\*"), "*x*");
  assert.equal(unescapeMarkdown("one<br/>two<BR />three"), "one<br>two<br>three");
  assert.equal(normalizeBreaks("x<br >y"), "x<br>y");
});

test("splitBreaks", () => {
  assert.deepEqual(splitBreaks("line one<br>line two"), ["line one", "line two"]);
  assert.deepEqual(splitBreaks("plain"), ["plain"]);
  assert.deepEqual(splitBreaks("a<br/>"), ["a", ""]);
});

test("parseLiteralMark: each kind, prefix kept", () => {
  const add = parseLiteralMark('{author="Claude" date="2026-10-30"++very ++}');
  assert.equal(add.kind, "addition");
  assert.equal(add.text, "very ");
  assert.equal(add.metaAuthor, "Claude");
  assert.equal(add.metaDate, "2026-10-30");
  assert.equal(parseLiteralMark("{--brown --}").kind, "deletion");
  const sub = parseLiteralMark("{~~a | b~>c | d~~}");
  assert.equal(sub.kind, "substitution");
  assert.equal(sub.oldText, "a | b");
  assert.equal(sub.newText, "c | d");
  assert.equal(parseLiteralMark("{>>Is this right?<<}").kind, "comment");
  assert.equal(parseLiteralMark("{==x==}").kind, "highlight");
  assert.equal(parseLiteralMark("{=+ai+=}").kind, "aitext");
});

test("parseLiteralMark: a <br> inside a substitution's new text", () => {
  const sub = parseLiteralMark("{~~one line~>line one<br>line two~~}");
  assert.equal(sub.kind, "substitution");
  assert.equal(sub.newText, "line one<br>line two");
});

test("parseLiteralMark: not exactly one mark gives null", () => {
  assert.equal(parseLiteralMark("plain"), null);
  assert.equal(parseLiteralMark("x {++a++}"), null);
  assert.equal(parseLiteralMark("{++a++}{--b--}"), null);
});

const TABLE = [
  "# T",
  "",
  "| Item | Status |",
  "| --- | --- |",
  '| Addition | the {author="Claude" date="2026-10-30"++very ++}quick fox |',
  '| Pipe | {author="Claude" date="2026-10-30"~~a \\| b~>c \\| d~~} |',
  '| Break | {~~one line~>line one<br/>line two~~} |',
  "| Comment | a cell{>>Is this right?<<} {>>Yes.<<} |",
  "| Twice | {++same++} and {++same++} |",
  "",
].join("\n");

test("resolveCellMarkOffset: a unique mark gives its source offset", () => {
  const parsed = parse(TABLE);
  const raw = '{author="Claude" date="2026-10-30"++very ++}';
  assert.equal(resolveCellMarkOffset(parsed, raw), TABLE.indexOf(raw));
});

test("resolveCellMarkOffset: the cell's unescaped pipe matches the escaped source", () => {
  const parsed = parse(TABLE);
  const at = resolveCellMarkOffset(parsed, '{author="Claude" date="2026-10-30"~~a | b~>c | d~~}');
  assert.equal(at, TABLE.indexOf('{author="Claude" date="2026-10-30"~~a \\|'));
});

test("resolveCellMarkOffset: a <br/> in the source matches the cell's <br>", () => {
  const parsed = parse(TABLE);
  assert.equal(resolveCellMarkOffset(parsed, "{~~one line~>line one<br>line two~~}"), TABLE.indexOf("{~~one line"));
});

test("resolveCellMarkOffset: a reply maps to its thread's start", () => {
  const parsed = parse(TABLE);
  assert.equal(resolveCellMarkOffset(parsed, "{>>Yes.<<}"), TABLE.indexOf("{>>Is this right?"));
});

test("resolveCellMarkOffset: two identical marks, or none, give null", () => {
  const parsed = parse(TABLE);
  assert.equal(resolveCellMarkOffset(parsed, "{++same++}"), null);
  assert.equal(resolveCellMarkOffset(parsed, "{++absent++}"), null);
});

test("cellMarkAttrs: named author gets a hue, title, mark text and offset", () => {
  const raw = '{author="Claude (editor)" date="2026-10-30"++very ++}';
  const a = cellMarkAttrs(parseLiteralMark(raw), raw, 42, "");
  assert.equal(a.title, "Claude (editor) · 2026-10-30");
  assert.ok(/^[0-7]$/.test(a["data-author-hue"]));
  assert.equal(a["data-tc-mark"], raw);
  assert.equal(a["data-tc-offset"], "42");
});

test("cellMarkAttrs: no author falls back to the local name, then You", () => {
  const raw = "{--x--}";
  const node = parseLiteralMark(raw);
  assert.equal(cellMarkAttrs(node, raw, null, "Pat").title, "Pat");
  const you = cellMarkAttrs(node, raw, null, "");
  assert.equal(you.title, "You");
  assert.equal(you["data-author-hue"], undefined);
  assert.equal(you["data-tc-offset"], undefined);
});

test("cellMarkAttrs: AI text is visual-only (no offset, no click target)", () => {
  const raw = '{author="Claude"=+ai+=}';
  const a = cellMarkAttrs(parseLiteralMark(raw), raw, 7, "");
  assert.equal(a["data-tc-offset"], undefined);
  assert.equal(a["data-tc-mark"], undefined);
});
