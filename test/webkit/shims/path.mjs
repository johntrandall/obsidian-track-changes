// node:path (POSIX) for the WebKit run: just what the tests use.
function normalize(p) {
  const abs = p.startsWith("/");
  const out = [];
  for (const seg of p.split("/")) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") out.pop();
    else out.push(seg);
  }
  return (abs ? "/" : "") + out.join("/");
}
export function resolve(...parts) {
  let p = "";
  for (const part of parts) p = part.startsWith("/") ? part : p + "/" + part;
  return normalize(p);
}
export function join(...parts) {
  return normalize(parts.join("/"));
}
export function dirname(p) {
  const i = p.replace(/\/+$/, "").lastIndexOf("/");
  return i <= 0 ? (i === 0 ? "/" : ".") : p.slice(0, i);
}
export function basename(p) {
  return p.replace(/\/+$/, "").split("/").pop();
}
export { normalize };
export default { resolve, join, dirname, basename, normalize };
