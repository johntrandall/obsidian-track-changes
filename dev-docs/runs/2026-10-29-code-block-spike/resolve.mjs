import { build } from "esbuild"; import { readFileSync } from "node:fs";
const b = async (f) => import("data:text/javascript;base64," + Buffer.from((await build({ entryPoints: [process.cwd()+"/src/"+f], bundle: true, format: "esm", platform: "node", write: false })).outputFiles[0].text).toString("base64"));
const { parse } = await b("parser.ts"); const ops = await b("operations.ts");
for (const f of process.argv.slice(2)) for (const action of ["accept", "reject"]) {
  let src = readFileSync(f, "utf8");
  // resolve every change, re-parsing between, as the panel does card by card
  for (let i = 0; i < 4; i++) { const p = parse(src); const n = p.nodes.find(x => ["addition","deletion","substitution"].includes(x.kind)); if (!n) break;
    const edits = ops.resolveChange ? ops.resolveChange(src, p, n, action, "2026-10-29") : null;
    if (!edits) { console.log("no resolveChange"); process.exit(1); }
    src = ops.applyEdits(src, edits); }
  const fences = (src.match(/^```/gm) || []).length;
  console.log(f.split("/").pop(), action, "-> fences:", fences, fences % 2 === 0 ? "(balanced)" : "(UNBALANCED)", "| left:", JSON.stringify(src.replace(/^Intro\.\n\n|\n\nAfter\.\n$/g, "")));
}
