import { strict as assert } from "node:assert";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { build } from "esbuild";

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = await build({
  entryPoints: [resolve(__dirname, "../src/pending.ts")],
  bundle: true,
  format: "esm",
  target: "es2018",
  write: false,
  platform: "node",
});
const mod = await import(
  "data:text/javascript;base64," + Buffer.from(out.outputFiles[0].text).toString("base64")
);
const { summarizeSource, sortRows, filterRows, totals, pendingCount, describeSummary, readReviewFrontmatter, markCount, isIgnored, ignoreRefusal, IGNORED_PANEL_TEXT } = mod;
const counts = (s) => ({ suggestions: s.suggestions, comments: s.comments, highlights: s.highlights });

// ---- summarizeSource mirrors the panel header ----

// No braces at all: the fast path, nothing pending.
assert.deepEqual(counts(summarizeSource("plain prose\nno marks")), {
  suggestions: 0, comments: 0, highlights: 0,
});
// Braces but no CriticMarkup.
assert.deepEqual(counts(summarizeSource("a {b} c")), { suggestions: 0, comments: 0, highlights: 0 });

// One of each change kind.
assert.deepEqual(
  counts(summarizeSource("{++add++} {--del--} {~~old~>new~~}")),
  { suggestions: 3, comments: 0, highlights: 0 },
);

// A thread (root + reply) is one comment; a lone highlight counts.
assert.deepEqual(
  counts(summarizeSource("x {>>root<<} {>>reply<<} y\n\n{==hl==} z")),
  { suggestions: 0, comments: 1, highlights: 1 },
);

// A highlight anchoring a thread folds into the thread: not a highlight.
assert.deepEqual(
  counts(summarizeSource("{==anchored==}{>>why<<}")),
  { suggestions: 0, comments: 1, highlights: 0 },
);

// A thread anchored on a change folds into the suggestion: not a comment.
assert.deepEqual(
  counts(summarizeSource('{++new++}{author="Claude" date="2026-10-20">>rationale<<}')),
  { suggestions: 1, comments: 0, highlights: 0 },
);

// Blank line between comments: two separate threads.
assert.deepEqual(
  counts(summarizeSource("{>>a<<}\n\n{>>b<<}")),
  { suggestions: 0, comments: 2, highlights: 0 },
);

// aitext is visual-only and never pending; marks in code are not marks.
assert.deepEqual(
  counts(summarizeSource("{=+ai+=}\n\n```\n{++not a mark++}\n```\n`{--inline--}`")),
  { suggestions: 0, comments: 0, highlights: 0 },
);

assert.equal(pendingCount({ suggestions: 2, comments: 1, highlights: 1, reviewWhole: false }), 4);
assert.equal(pendingCount({ suggestions: 0, comments: 0, highlights: 0, reviewWhole: true }), 1);
assert.equal(markCount({ suggestions: 0, comments: 0, highlights: 0, reviewWhole: true }), 0);

// ---- frontmatter review flag (watchbill review-modes contract) ----

assert.deepEqual(readReviewFrontmatter("no frontmatter {>>c<<}"), { review: null, approvedAt: null, ignore: false });
assert.deepEqual(
  readReviewFrontmatter('---\ntitle: X\nreview: Whole   # set by watchbill\napproved_at: "2026-10-22T13:20:00-04:00"\nopen_marks: 6\n---\nbody'),
  { review: "whole", approvedAt: "2026-10-22T13:20:00-04:00", ignore: false },
);
assert.deepEqual(readReviewFrontmatter("---\nreview: delta\n---\n"), { review: "delta", approvedAt: null, ignore: false });
// Unterminated frontmatter is not frontmatter.
assert.deepEqual(readReviewFrontmatter("---\nreview: whole\nbody"), { review: null, approvedAt: null, ignore: false });
// A flagged note with no marks is pending (one item); delta is the plugin's own business and adds nothing.
const flagged = summarizeSource("---\nreview: whole\napproved_at: 2026-10-01\n---\nclean prose");
assert.equal(flagged.reviewWhole, true);
assert.equal(flagged.approvedAt, "2026-10-01");
assert.equal(pendingCount(flagged), 1);
assert.equal(summarizeSource("---\nreview: delta\n---\n{++a++}").reviewWhole, false);
// Flagged AND marked: both counted, shown once by the overview.
const both = summarizeSource("---\nreview: whole\n---\n{++a++}\n\n{>>c<<}");
assert.deepEqual([both.reviewWhole, both.suggestions, both.comments], [true, 1, 1]);

// ---- the ignore marker: track_changes: ignore (watchbill's request, 2026-10-30) ----

const ig = (fm) => readReviewFrontmatter(`---\n${fm}\n---\n{++a++}`).ignore;
assert.equal(ig("track_changes: ignore"), true);
// Value case-insensitive, quotes allowed, trailing comment ignored, spaces around it.
assert.equal(ig("track_changes: IGNORE"), true);
assert.equal(ig("track_changes: Ignore"), true);
assert.equal(ig('track_changes: "ignore"'), true);
assert.equal(ig("track_changes: 'Ignore'"), true);
assert.equal(ig("track_changes: ignore   # frozen fixture, marks are data"), true);
assert.equal(ig('track_changes: "ignore" # quoted, then a comment'), true);
assert.equal(ig("track_changes:\tignore\t"), true);
// Any other value, an empty value, a comment alone, or no key: a normal note.
assert.equal(ig("track_changes: review"), false);
assert.equal(ig("track_changes: ignored"), false);
assert.equal(ig("track_changes: no"), false);
assert.equal(ig('track_changes: "ignore me"'), false);
assert.equal(ig("track_changes:"), false);
assert.equal(ig("track_changes: # ignore"), false);
assert.equal(ig("title: x"), false);
// Top level only: an indented key belongs to some other mapping; key names are case-sensitive.
assert.equal(ig("meta:\n  track_changes: ignore"), false);
assert.equal(ig("Track_Changes: ignore"), false);
// Front matter only: the same line in the body, or unterminated front matter, is not the marker.
assert.equal(readReviewFrontmatter("prose\ntrack_changes: ignore\n{++a++}").ignore, false);
assert.equal(readReviewFrontmatter("---\ntrack_changes: ignore\nno closing fence {++a++}").ignore, false);
// Windows line endings read the same (every key, not only this one).
assert.deepEqual(
  readReviewFrontmatter("---\r\ntrack_changes: ignore\r\nreview: whole\r\napproved_at: 2026-10-01\r\n---\r\nbody"),
  { review: "whole", approvedAt: "2026-10-01", ignore: true },
);
// The other keys still read beside it.
assert.deepEqual(
  readReviewFrontmatter("---\ntrack_changes: ignore\nreview: whole\n---\n"),
  { review: "whole", approvedAt: null, ignore: true },
);

// summarizeSource: ignored, every count zero, nothing pending, even with review: whole.
{
  const marked = "---\ntrack_changes: ignore\n---\n{++add++} {--del--}\n\n{>>c<<}\n\n{==hl==} x";
  const s = summarizeSource(marked);
  assert.equal(s.ignored, true);
  assert.deepEqual(counts(s), { suggestions: 0, comments: 0, highlights: 0 });
  assert.equal(s.reviewWhole, false);
  assert.equal(pendingCount(s), 0);
  const whole = summarizeSource("---\nreview: whole\ntrack_changes: ignore\napproved_at: 2026-10-01\n---\n{++a++}");
  assert.equal(whole.ignored, true);
  assert.equal(whole.reviewWhole, false);
  assert.equal(pendingCount(whole), 0);
  // The same marks without the key count as usual and are not ignored.
  const normal = summarizeSource("---\ntrack_changes: review\n---\n{++add++} {--del--}\n\n{>>c<<}\n\n{==hl==} x");
  assert.equal(normal.ignored, false);
  assert.deepEqual(counts(normal), { suggestions: 2, comments: 1, highlights: 1 });
}

// The one guard every mark-changing path calls.
assert.equal(isIgnored("---\ntrack_changes: ignore\n---\n"), true);
assert.equal(isIgnored("{++a++}"), false);
assert.equal(ignoreRefusal("{++a++}"), null);
assert.equal(ignoreRefusal("---\ntrack_changes: other\n---\n{++a++}"), null);
{
  const r = ignoreRefusal("---\ntrack_changes: ignore\n---\n{++a++}");
  assert.equal(typeof r, "string");
  assert.match(r, /track_changes: ignore/);
}
assert.match(IGNORED_PANEL_TEXT, /^Ignored: .*`track_changes: ignore`.*Remove the line to review them\.$/);

// Whole-review rows sort first; never-approved before dirty (approved_at set).
assert.deepEqual(
  sortRows([
    { path: "b.md", suggestions: 9, comments: 0, highlights: 0 },
    { path: "c.md", suggestions: 0, comments: 0, highlights: 0, reviewWhole: true, approvedAt: "2026-10-01" },
    { path: "a.md", suggestions: 0, comments: 0, highlights: 0, reviewWhole: true, approvedAt: null },
  ]).map((r) => r.path),
  ["a.md", "c.md", "b.md"],
);

// ---- ordering: most to review first, suggestions outrank comments outrank highlights ----

const rows = [
  { path: "b/two.md", suggestions: 1, comments: 5, highlights: 0 },
  { path: "a/one.md", suggestions: 1, comments: 5, highlights: 0 },
  { path: "c/three.md", suggestions: 0, comments: 9, highlights: 9 },
  { path: "d/four.md", suggestions: 3, comments: 0, highlights: 0 },
  { path: "e/five.md", suggestions: 1, comments: 5, highlights: 2 },
];
assert.deepEqual(
  sortRows(rows).map((r) => r.path),
  ["d/four.md", "e/five.md", "a/one.md", "b/two.md", "c/three.md"],
);
// sortRows does not mutate its input.
assert.equal(rows[0].path, "b/two.md");

// ---- filter: case-insensitive, every term must match somewhere in the path ----

assert.equal(filterRows(rows, "").length, 5);
assert.equal(filterRows(rows, "   ").length, 5);
assert.deepEqual(filterRows(rows, "ONE").map((r) => r.path), ["a/one.md"]);
assert.deepEqual(filterRows(rows, "e .md").map((r) => r.path).sort(), [
  "a/one.md", "c/three.md", "e/five.md",
]);
assert.equal(filterRows(rows, "zzz").length, 0);

// ---- totals and the summary line ----

assert.deepEqual(totals(rows), { files: 5, wholeReview: 0, suggestions: 6, comments: 24, highlights: 11 });
assert.deepEqual(totals([]), { files: 0, wholeReview: 0, suggestions: 0, comments: 0, highlights: 0 });
assert.equal(describeSummary({ suggestions: 0, comments: 0, highlights: 0, wholeReview: 2 }), "0 suggestions · 0 comments · 2 to read whole");
assert.equal(describeSummary({ suggestions: 1, comments: 2, highlights: 0 }), "1 suggestion · 2 comments");
assert.equal(describeSummary({ suggestions: 0, comments: 1, highlights: 1 }), "0 suggestions · 1 comment · 1 highlight");

console.log("pending.test.mjs: ok");

// ---- countReviewItems: the panel header and the overview share one count ----
// Regression (2026-10-23, found by the mobile smoke): the panel header
// subtracted resolved lone highlights from the comment count.
{
  const { countReviewItems } = mod;
  const p = await build({
    entryPoints: [resolve(__dirname, "../src/parser.ts")],
    bundle: true, format: "esm", target: "es2018", write: false, platform: "node",
  });
  const { parse } = await import(
    "data:text/javascript;base64," + Buffer.from(p.outputFiles[0].text).toString("base64")
  );
  const src = [
    "a {>>open one<<} b",
    "",
    "c {>>open two<<} d",
    "",
    'e {resolved="2026-10-20">>done<<} f',
    "",
    '{resolved="2026-10-21"==lone resolved==} g',
    "",
    "{==lone open==} h {++add++}",
  ].join("\n");
  const c = countReviewItems(parse(src));
  assert.deepEqual(c, { suggestions: 1, comments: 2, highlights: 1, resolvedThreads: 1, resolvedHighlights: 1 });
  // The overview row says the same.
  assert.deepEqual(counts(summarizeSource(src)), { suggestions: 1, comments: 2, highlights: 1 });
  console.log("  ok  - countReviewItems: a resolved highlight never lowers the comment count; panel and overview agree");
}
