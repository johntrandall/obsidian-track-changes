import { strict as assert } from "node:assert";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { readFileSync } from "node:fs";
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

const { baseText, textHash, stripStatusLine, openMarkCount, openReviewCounts, approvalStamp, buildAnchor } =
  await loadTs("../src/approval.ts");

let failed = 0;
function test(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => console.log(`  ok  - ${name}`))
    .catch((e) => {
      failed++;
      console.log(`  FAIL - ${name}`);
      console.log(e);
    });
}

// The shared vectors: written by the agent tool (Python), checked here (TypeScript).
// If this fails, one implementation of the base text drifted from the other.
const fixtureDir = resolve(__dirname, "fixtures/approval");
const sample = readFileSync(resolve(fixtureDir, "sample.md"), "utf8");
const expected = JSON.parse(readFileSync(resolve(fixtureDir, "sample.expected.json"), "utf8"));

await test("base text matches the agent tool's vector byte for byte", () => {
  assert.equal(baseText(sample), expected.base_text);
  assert.equal(baseText(sample, true), expected.proposed_text);
});

await test("hashes match the agent tool's vector", async () => {
  assert.equal(await textHash(baseText(sample)), expected.base_hash);
  assert.equal(await textHash(baseText(sample, true)), expected.proposed_hash);
  assert.match(expected.base_hash, /^sha256:[0-9a-f]{16}$/);
});

await test("status line is dropped only right after the first H1", () => {
  // The blank-line collapse happens later, in baseText, as in the tool.
  assert.equal(stripStatusLine("# T\n\n> Approved by J\n> second line\n\nprose"), "# T\n\n\nprose");
  assert.equal(baseText("# T\n\n> Approved by J\n> second line\n\nprose"), "# T\n\nprose");
  assert.equal(stripStatusLine("# T\n\nprose\n\n> Approved later"), "# T\n\nprose\n\n> Approved later");
  assert.equal(stripStatusLine("# T\n\n> A plain quote\n\nprose"), "# T\n\n> A plain quote\n\nprose");
});

await test("open marks are suggestions and comments, not highlights or AI text", () => {
  assert.equal(openMarkCount("---\nreview: whole\n---\n{++a++}\n\n{>>c<<} {==h==} {=+ai+=}"), 2);
  // A comment right after a suggestion is that suggestion's thread: one item to decide.
  assert.equal(openMarkCount("{++a++} {>>c<<}"), 1);
  assert.equal(openMarkCount("clean {==h==}"), 0);
});

await test("resolved comments never block approval; unresolved and agent-acknowledged ones do", () => {
  // Defect 2026-10-23 (watchbill intake): Approve refused a note whose only marks were resolved comments.
  const resolved = '# T\n\nProse {resolved="2026-10-23" author="Claude (editor)">>why<<}{author="R">>a reply<<} here.\n\nMore {resolved="2026-10-23">>done<<} text.\n';
  assert.equal(openMarkCount(resolved), 0);
  assert.deepEqual(openReviewCounts(resolved), { suggestions: 0, comments: 0 });
  assert.equal(openMarkCount(resolved + "\nAsk {>>open question<<}\n"), 1);
  assert.equal(openMarkCount(resolved + '\nSeen {acknowledged="2026-10-23" acknowledged-by="Claude (editor)">>seen<<}\n'), 1);
  assert.deepEqual(openReviewCounts(resolved.replace("Prose", "Prose {++new++}")), { suggestions: 1, comments: 0 });
  // A resolved flag on a change-anchored thread does not close the change.
  assert.equal(openMarkCount('x {++a++}{resolved="2026-10-23">>why<<} y'), 1);
});

await test("the stamp has seconds and a numeric offset; the anchor is pending on the sha", async () => {
  assert.match(approvalStamp(new Date(2026, 9, 22, 13, 20, 0)), /^2026-10-22T13:20:00[+-]\d{2}:\d{2}$/);
  const a = await buildAnchor("---\nreview: whole\n---\n# T\n\nbody", "John", "track-changes panel");
  assert.equal(a.status, "accepted");
  assert.equal(a.approved_sha, "pending");
  assert.equal(a.approved_whole_sha, "pending");
  assert.equal(a.approved_hash, await textHash("# T\n\nbody"));
  assert.equal((await buildAnchor("x", "", "v")).approved_by, "You");
});

if (failed > 0) {
  console.log(`approval.test.mjs: ${failed} failed`);
  process.exit(1);
}
console.log("approval.test.mjs: ok");
