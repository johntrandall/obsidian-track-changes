// node:url for the WebKit run.
export function fileURLToPath(u) {
  return decodeURIComponent(new URL(String(u)).pathname);
}
export function pathToFileURL(p) {
  return new URL("file://" + encodeURI(p));
}
export default { fileURLToPath, pathToFileURL };
