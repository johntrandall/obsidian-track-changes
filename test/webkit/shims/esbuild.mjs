// esbuild for the WebKit run. The tests compile src/*.ts on the fly; the
// compiler stays in Node (reached through a Playwright binding) and only the
// compiled output comes back to be imported and executed by WebKit.
// Plugins cross the boundary as the source of their setup function.
export async function build(opts) {
  const plain = { ...opts };
  if (plain.plugins) plain.plugins = plain.plugins.map((p) => ({ name: p.name, setup: p.setup.toString() }));
  const outputFiles = await globalThis.__tcForwardBuild(plain);
  return { outputFiles, errors: [], warnings: [] };
}
export default { build };
