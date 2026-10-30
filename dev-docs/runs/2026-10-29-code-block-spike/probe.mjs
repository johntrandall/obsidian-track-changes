import { build } from "esbuild"; import { readFileSync } from "node:fs";
const out = await build({ entryPoints: [process.cwd() + "/src/parser.ts"], bundle: true, format: "esm", platform: "node", write: false });
const { parse } = await import("data:text/javascript;base64," + Buffer.from(out.outputFiles[0].text).toString("base64"));
for (const f of process.argv.slice(2)) {
  const src = readFileSync(f, "utf8"); const p = parse(src);
  const subs = p.nodes.filter(n => n.kind !== "comment");
  console.log(f.split("/").pop(), "nodes:", p.nodes.length, "kinds:", p.nodes.map(n => n.kind).join(","));
  const tilde = (src.match(/\{[^{}\n]*~~/g) || []).length; console.log("  substitution openers in text:", tilde);
}
