// Run the Node unit tests (test/*.test.mjs) inside Playwright's WebKit engine.
//
// Why: the iPad runs Obsidian on WebKit (JavaScriptCore); desktop Obsidian and
// `npm test` run on V8. A regex feature or a newer built-in that V8 accepts can
// still throw on iOS. This runner executes the same assertion files, unchanged,
// in a WebKit page, so the plugin's pure modules are exercised by the engine
// the iPad uses.
//
// How: each test file is bundled for the browser with esbuild. Its Node imports
// are swapped for small browser shims (test/webkit/shims/): `node:assert` is the
// `assert` npm port of Node's assert, `node:fs` reads from a table of fixture
// files the runner preloads, `node:path` / `node:url` are tiny POSIX helpers.
// The test's own `build()` call (it compiles src/*.ts on the fly) is forwarded
// to the real esbuild in Node through a Playwright binding, so compilation stays
// in Node while the compiled module is imported and executed by WebKit.
//
// Usage: npm run test:webkit            (all files)
//        node test/webkit/run.mjs bulk   (files whose name contains "bulk")
//
// Exit status is non-zero when any file sets process.exitCode, calls
// process.exit(non-zero), throws, or when the built-in canary (a test that must
// fail) passes, which would mean the harness cannot see failures.

import { build } from "esbuild";
import { webkit } from "playwright";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const testDir = resolve(root, "test");
const shimDir = resolve(here, "shims");

// Files that cannot run in a page, with the reason printed in the summary.
const SKIP = {
  "per-window-panel.test.mjs":
    "evaluates the CJS bundle of src/main.ts + src/panel/view.ts with node:vm runInNewContext and node:module createRequire against hand-made Obsidian window mocks; it tests Obsidian workspace wiring, not a pure module, and has no browser equivalent of a fresh V8 context",
};

const filter = process.argv.slice(2);
const files = readdirSync(testDir)
  .filter((f) => f.endsWith(".test.mjs"))
  .filter((f) => filter.length === 0 || filter.some((s) => f.includes(s)))
  .sort();

// Every file under test/fixtures and src, keyed by absolute path, for the
// node:fs shim (readFileSync is synchronous, so it cannot round-trip to Node).
function walk(dir, out = {}) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out[p] = readFileSync(p, "utf8");
  }
  return out;
}
const fileTable = { ...walk(resolve(testDir, "fixtures")), ...walk(resolve(root, "src")) };

const SHIMS = {
  "node:assert": resolve(shimDir, "assert.mjs"),
  "node:fs": resolve(shimDir, "fs.mjs"),
  "node:path": resolve(shimDir, "path.mjs"),
  "node:url": resolve(shimDir, "url.mjs"),
  esbuild: resolve(shimDir, "esbuild.mjs"),
};
const shimPlugin = {
  name: "webkit-shims",
  setup(b) {
    b.onResolve({ filter: /^(node:(assert|fs|path|url)|esbuild)$/ }, (a) => ({ path: SHIMS[a.path] }));
    b.onResolve({ filter: /^node:/ }, (a) => ({
      errors: [{ text: `${a.path} has no WebKit shim (test/webkit/shims); add one or list the file in SKIP` }],
    }));
  },
};

async function bundleTest(path) {
  const out = await build({
    entryPoints: [path],
    bundle: true,
    format: "esm",
    target: "es2022", // harness code only; src/*.ts is compiled by each test's own build() options (es2018)
    platform: "browser",
    write: false,
    plugins: [shimPlugin],
    define: {
      "import.meta.url": JSON.stringify(pathToFileURL(path).href),
      global: "globalThis",
    },
    logLevel: "silent",
  });
  return out.outputFiles[0].text;
}

// Rebuild a plugin passed from the page: its setup function travels as source.
function revivePlugin(p) {
  let setup;
  try {
    setup = new Function(`return ({ ${p.setup} }).setup;`)();
  } catch {
    setup = new Function(`return (${p.setup});`)();
  }
  return { name: p.name, setup };
}

// The page's esbuild shim calls this. Options are plain data except plugins.
async function forwardBuild(opts) {
  const o = { ...opts };
  if (o.plugins) o.plugins = o.plugins.map(revivePlugin);
  const r = await build(o);
  return r.outputFiles.map((f) => ({ path: f.path, text: f.text }));
}

const PRELUDE = `
globalThis.__tcFiles = ${JSON.stringify(fileTable)};
class ExitSignal extends Error { constructor(code) { super("process.exit(" + code + ")"); this.name = "ExitSignal"; this.code = code; } }
globalThis.process = { exitCode: undefined, env: {}, argv: [], platform: "webkit",
  exit(code) { throw new ExitSignal(code ?? process.exitCode ?? 0); },
  nextTick(fn, ...a) { Promise.resolve().then(() => fn(...a)); } };
function b64(s) { const bytes = new TextEncoder().encode(s); let bin = ""; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(bin); }
globalThis.Buffer = { from(s) { return { toString(enc) { if (enc !== "base64") throw new Error("Buffer shim supports base64 only"); return b64(String(s)); } }; } };
const fmt = (a) => a instanceof Error ? (a.stack && a.stack.includes(a.message) ? a.name + ": " + a.message + "\\n" + a.stack : a.name + ": " + a.message + "\\n" + (a.stack || "")) : (typeof a === "object" ? (() => { try { return JSON.stringify(a); } catch { return String(a); } })() : String(a));
for (const k of ["log", "error", "warn"]) { const orig = console[k].bind(console); console[k] = (...a) => orig(a.map(fmt).join(" ")); }
`;

const HTML = `<!doctype html><meta charset="utf-8"><title>webkit tests</title>
<script src="/prelude.js"></script>
<script type="module">
import("/test.js").then(
  () => { window.__tcResult = { exitCode: process.exitCode ?? 0 }; },
  (e) => {
    if (e && e.name === "ExitSignal") window.__tcResult = { exitCode: e.code };
    else window.__tcResult = { exitCode: 1, error: (e && (e.name + ": " + e.message + "\\n" + (e.stack || ""))) || String(e) };
  });
</script>`;

async function runOne(browser, name, code) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const lines = [];
  page.on("console", (m) => lines.push(m.text()));
  page.on("pageerror", (e) => lines.push("pageerror: " + e.message));
  await page.exposeBinding("__tcForwardBuild", (_src, opts) => forwardBuild(opts));
  // localhost is a secure context, so crypto.subtle (approval hashes) exists.
  await page.route("http://localhost/**", (route) => {
    const u = new URL(route.request().url());
    if (u.pathname === "/") return route.fulfill({ contentType: "text/html", body: HTML });
    if (u.pathname === "/prelude.js") return route.fulfill({ contentType: "text/javascript", body: PRELUDE });
    if (u.pathname === "/test.js") return route.fulfill({ contentType: "text/javascript", body: code });
    return route.fulfill({ status: 404, body: "not found" });
  });
  await page.goto("http://localhost/");
  await page.waitForFunction(() => window.__tcResult !== undefined, null, { timeout: 120000 });
  const result = await page.evaluate(() => window.__tcResult);
  await context.close();
  const ok = lines.filter((l) => /^\s*ok\b/.test(l)).length;
  const fails = lines.filter((l) => /^\s*FAIL\b/.test(l)).length;
  return { name, ...result, ok, fails, lines };
}

// The canary goes through the same path as a real test (esbuild shim -> Node
// compile -> data: URL import in WebKit), checks it really ran in the page, and
// then fails on purpose. The runner must see that failure.
const CANARY = `
import { strict as assert } from "node:assert";
import { build } from "esbuild";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const out = await build({ entryPoints: [resolve(dirname(fileURLToPath(import.meta.url)), "../src/parser.ts")],
  bundle: true, format: "esm", target: "es2018", write: false, platform: "neutral" });
const { parse } = await import("data:text/javascript;base64," + Buffer.from(out.outputFiles[0].text).toString("base64"));
assert.equal(parse("a {++b++} c").nodes.length, 1);
assert.ok(typeof window === "object" && /AppleWebKit/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent));
console.log("  ok  - canary ran src/parser.ts in WebKit: " + navigator.userAgent);
try { assert.deepEqual({ a: [1, 2] }, { a: [1, "2"] }); console.log("  ok  - canary deepEqual"); }
catch (e) { console.error("  FAIL - canary deepEqual (expected)"); process.exitCode = 1; }
`;
const browser = await webkit.launch();
console.log(`WebKit ${browser.version()} (Playwright ${(await import("playwright/package.json", { with: { type: "json" } })).default.version})`);

// Canary first: the harness must report a failing deepEqual as a failure.
{
  const out = await build({
    stdin: { contents: CANARY, resolveDir: testDir, sourcefile: resolve(testDir, "canary.mjs"), loader: "js" },
    bundle: true, format: "esm", target: "es2022", platform: "browser", write: false, plugins: [shimPlugin], logLevel: "silent",
    define: { "import.meta.url": JSON.stringify(pathToFileURL(resolve(testDir, "canary.mjs")).href) },
  });
  const r = await runOne(browser, "canary", out.outputFiles[0].text);
  const ran = r.lines.some((l) => l.includes("canary ran src/parser.ts in WebKit"));
  if (r.exitCode === 0 || !ran) {
    console.error(ran ? "canary: a failing assertion was reported as passing; the harness is broken"
      : "canary: the compiled module did not run in the page; the harness is broken");
    for (const l of r.lines) console.error("  " + l);
    if (r.error) console.error("  " + r.error);
    await browser.close();
    process.exit(2);
  }
  console.log("canary: src compiled and ran in WebKit; its deliberate failure was detected");
}

let failed = 0;
let totalOk = 0;
const skipped = [];
for (const f of files) {
  if (SKIP[f]) {
    skipped.push(f);
    continue;
  }
  let r;
  try {
    r = await runOne(browser, f, await bundleTest(resolve(testDir, f)));
  } catch (e) {
    r = { name: f, exitCode: 1, error: String(e && e.message || e), ok: 0, fails: 0, lines: [] };
  }
  totalOk += r.ok;
  const status = r.exitCode === 0 && !r.error ? "pass" : "FAIL";
  const note = r.ok === 0 && r.lines.length ? `; last line: ${r.lines[r.lines.length - 1]}` : "";
  console.log(`${status.padEnd(4)}  ${f}  (${r.ok} ok${r.fails ? `, ${r.fails} failed` : ""}${note})`);
  if (status !== "pass") {
    failed++;
    for (const l of r.lines) if (!/^\s*ok\b/.test(l)) console.log("      " + l.replace(/\n/g, "\n      "));
    if (r.error) console.log("      " + r.error.replace(/\n/g, "\n      "));
  }
}
await browser.close();

for (const f of skipped) console.log(`skip  ${f}: ${SKIP[f]}`);
console.log(`\nWebKit: ${files.length - skipped.length - failed} files passed, ${failed} failed, ${skipped.length} skipped; ${totalOk} ok test cases`);
process.exit(failed ? 1 : 0);
