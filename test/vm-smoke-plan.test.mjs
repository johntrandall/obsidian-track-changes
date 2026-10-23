// Checks the expectations in test/fixtures/vm-mobile-smoke.json against the
// pure modules, so the VM smoke (scripts/vm-mobile-smoke.js, run by
// `scripts/vm-test.sh smoke-mobile`) asserts values that are right by the
// plugin's own logic, not values copied from a screen. Header counts are
// derived from pending.summarizeSource, which CLAUDE.md says must equal the
// review panel header's.
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
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
  return import("data:text/javascript;base64," + Buffer.from(out.outputFiles[0].text).toString("base64"));
}

const { parse } = await loadTs("../src/parser.ts");
const ops = await loadTs("../src/operations.ts");
const { summarizeSource } = await loadTs("../src/pending.ts");
const { resolvedThreadIndexes, resolvedHighlightIndexes } = await loadTs("../src/resolution.ts");
const { checkGuards } = await loadTs("../src/authoring.ts");
const { openMarkCount } = await loadTs("../src/approval.ts");

const plan = JSON.parse(readFileSync(resolve(__dirname, "fixtures/vm-mobile-smoke.json"), "utf8"));
const fixture = readFileSync(resolve(__dirname, "fixtures/vm-fixture.md"), "utf8");
const STAMP = "2026-10-23";

let failures = 0;
function test(name, fn) {
  try {
    fn();
    console.log("  ok  -", name);
  } catch (err) {
    failures++;
    console.error("  FAIL -", name);
    console.error(err);
  }
}

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
function header(src) {
  const s = summarizeSource(src);
  const p = parse(src);
  const resolved = resolvedThreadIndexes(p).size + resolvedHighlightIndexes(p).size;
  const parts = [plural(s.comments, "comment", "comments"), plural(s.suggestions, "suggestion", "suggestions")];
  if (s.highlights > 0) parts.push(plural(s.highlights, "highlight", "highlights"));
  if (resolved > 0) parts.push(`${resolved} resolved`);
  return {
    counts: parts.join(" · "),
    resolvedTitle: resolved > 0 ? `Resolved (${resolved})` : null,
    decide: s.suggestions,
    hasThreads: p.threads.length > 0,
  };
}
const toRegex = (s) => new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/<DATE>/g, "\\d{4}-\\d{2}-\\d{2}"));
function checkText(src, expect) {
  for (const c of expect.contains ?? []) assert.match(src, toRegex(c), `missing: ${c}`);
  for (const a of expect.absent ?? []) assert.ok(!toRegex(a).test(src), `present: ${a}`);
}
function buttons(h) {
  const out = [];
  if (h.decide > 0) out.push("Accept all", "Reject all");
  if (h.hasThreads) out.push("Remove comments");
  return out;
}

console.log("vm smoke plan:");

test("initial header", () => {
  const h = header(fixture);
  assert.equal(h.counts, plan.initial.counts);
  assert.equal(h.resolvedTitle, plan.initial.resolvedTitle);
  assert.equal(h.decide, plan.initial.decide);
  assert.deepEqual(buttons(h), plan.initial.buttons);
});

const CURSOR_TITLES = {
  accept: "Accept change", reject: "Reject change", "remove-highlight": "Remove highlight",
  "delete-comment": "Delete comment", "resolve-thread": "Mark resolved", "reopen-thread": "Reopen",
};
const AUTHORING = [
  ["addition", "Insert addition"], ["deletion", "Mark selection as deletion"], ["substitution", "Mark selection for substitution"],
  ["highlight", "Highlight selection"], ["comment", "Insert comment"],
];
for (const m of plan.menus) {
  test(`menu ${m.name}`, () => {
    const p = parse(fixture);
    const titles = [];
    if (m.cursorIn) {
      const at = fixture.indexOf(m.cursorIn) + (m.cursorAt ?? 2);
      for (const [action, title] of Object.entries(CURSOR_TITLES)) {
        if (typeof ops.editsAtCursor(fixture, p, at, action, STAMP) !== "string") titles.push(title);
      }
    } else {
      const from = fixture.indexOf(m.selectFrom);
      const to = m.selectTo ? fixture.indexOf(m.selectTo) + m.selectTo.length : from + m.selectLength;
      const n = ops.changesInRange(p, from, to).length;
      if (n > 0) titles.push(`Accept ${n === 1 ? "change" : `${n} changes`} in selection`, `Reject ${n === 1 ? "change" : `${n} changes`} in selection`);
      else {
        for (const [kind, title] of AUTHORING) {
          const fits = kind === "comment" || (kind === "addition") === (from === to);
          if (fits && checkGuards(fixture, from, to, kind) === null) titles.push(title);
        }
      }
    }
    for (const t of m.includes) assert.ok(titles.includes(t), `menu lacks "${t}" (has ${JSON.stringify(titles)})`);
  });
}

let src = fixture;
for (const s of plan.steps) {
  test(`step ${s.name}`, () => {
    const p = parse(src);
    if (s.command) {
      const i = src.indexOf(s.cursorIn);
      assert.ok(i >= 0, `cursor target not found: ${s.cursorIn}`);
      const edits = ops.editsAtCursor(src, p, i + (s.cursorAt ?? 2), s.action, STAMP);
      assert.notEqual(typeof edits, "string", `command would only show a Notice: ${edits}`);
      src = ops.applyEdits(src, edits);
    } else if (s.button === "Accept all") {
      src = ops.applyEdits(src, ops.resolveAllChanges(src, p, "accept", STAMP));
    } else if (s.button === "Remove comments") {
      src = ops.applyEdits(src, ops.removeAllComments(src, p));
    } else if (s.approve) {
      assert.equal(openMarkCount(src), 0, "Approve needs every suggestion and comment decided");
      return;
    }
    const h = header(src);
    assert.equal(h.counts, s.expect.counts);
    assert.equal(h.resolvedTitle, s.expect.resolvedTitle);
    assert.equal(h.decide, s.expect.decide);
    if (s.expect.buttons) assert.deepEqual(buttons(h), s.expect.buttons);
    checkText(src, s.expect);
  });
}

if (failures) process.exit(1);
