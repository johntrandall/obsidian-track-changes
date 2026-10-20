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
const { applyEdits, resolveAllChanges, changesInRange, resolveChangesInRange, rebaseEdits } =
  await loadTs("../src/operations.ts");

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

const SRC =
  "A {++added++} b {--gone--} c {~~old~>new~~}{>>why<<} d {>>lone comment<<} e {==hl==} f {=+ai+=}.";

test("resolveAllChanges accepts every suggestion, takes anchored threads, leaves the rest", () => {
  const r = parse(SRC);
  const out = applyEdits(SRC, resolveAllChanges(SRC, r, "accept"));
  assert.equal(out, "A added b  c new d {>>lone comment<<} e {==hl==} f {=+ai+=}.");
});

test("resolveAllChanges rejects every suggestion", () => {
  const r = parse(SRC);
  const out = applyEdits(SRC, resolveAllChanges(SRC, r, "reject"));
  assert.equal(out, "A  b gone c old d {>>lone comment<<} e {==hl==} f {=+ai+=}.");
});

test("resolveAllChanges on a note without suggestions is empty", () => {
  const src = "x {>>c<<} {==h==}";
  assert.deepEqual(resolveAllChanges(src, parse(src), "accept"), []);
});

test("bulk edits fail closed under drift, like a single accept: dropped, never misapplied", () => {
  const r = parse(SRC);
  const edits = resolveAllChanges(SRC, r, "accept");
  // Unchanged doc: every edit verifies in place.
  assert.equal(rebaseEdits(SRC, edits).dropped, 0);
  // Prose inserted ahead: the raw-mark anchors no longer verify at their
  // offsets and carry no `before` context, so rebase drops them all rather
  // than guess (the panel re-parses and the user clicks again).
  const drifted = "Intro. " + SRC;
  const { edits: rebased, dropped } = rebaseEdits(drifted, edits);
  assert.equal(dropped, edits.length);
  assert.equal(applyEdits(drifted, rebased), drifted);
});

test("changesInRange: overlap and touch count, order of the ends does not matter", () => {
  const r = parse(SRC);
  const add = r.nodes[0];
  const del = r.nodes[1];
  // A selection strictly inside the deletion.
  assert.deepEqual(changesInRange(r, del.from + 2, del.to - 2).map((n) => n.kind), ["deletion"]);
  // A selection spanning the first two marks.
  assert.deepEqual(changesInRange(r, add.from + 1, del.from + 1).map((n) => n.kind), ["addition", "deletion"]);
  // Reversed ends.
  assert.deepEqual(changesInRange(r, del.from + 1, add.from + 1).map((n) => n.kind), ["addition", "deletion"]);
  // Touching the end of the addition (ends inclusive).
  assert.deepEqual(changesInRange(r, add.to, add.to + 1).map((n) => n.kind), ["addition"]);
  // Prose only.
  assert.deepEqual(changesInRange(r, 0, 1), []);
});

test("resolveChangesInRange resolves only the touched suggestions, threads included", () => {
  const r = parse(SRC);
  const sub = r.nodes[2];
  const out = applyEdits(SRC, resolveChangesInRange(SRC, r, sub.from, sub.to, "accept"));
  assert.equal(out, "A {++added++} b {--gone--} c new d {>>lone comment<<} e {==hl==} f {=+ai+=}.");
  const out2 = applyEdits(SRC, resolveChangesInRange(SRC, r, 0, r.nodes[1].to, "reject"));
  assert.equal(out2, "A  b gone c {~~old~>new~~}{>>why<<} d {>>lone comment<<} e {==hl==} f {=+ai+=}.");
});

test("resolveChangesInRange explains an empty selection or one without suggestions", () => {
  const r = parse(SRC);
  assert.equal(resolveChangesInRange(SRC, r, 3, 3, "accept"), "Select the text whose suggestions to accept.");
  assert.equal(resolveChangesInRange(SRC, r, 0, 1, "accept"), "No suggestions in the selection.");
});

if (failed > 0) {
  console.log(`bulk.test.mjs: ${failed} failed`);
  process.exit(1);
}
console.log("bulk.test.mjs: ok");
