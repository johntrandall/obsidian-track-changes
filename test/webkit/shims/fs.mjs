// node:fs for the WebKit run. readFileSync is synchronous, so it reads from the
// table of files (test/fixtures/**, src/**) the runner preloads into the page.
export function readFileSync(path, encoding) {
  const text = globalThis.__tcFiles[String(path)];
  if (text === undefined) {
    throw new Error(`ENOENT (WebKit fs shim, only test/fixtures and src are preloaded): ${path}`);
  }
  if (encoding === undefined) throw new Error("WebKit fs shim returns text only; pass an encoding");
  return text;
}
export default { readFileSync };
