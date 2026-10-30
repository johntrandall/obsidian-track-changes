#!/bin/bash
# scripts/test-vault.sh — this project's own Obsidian test vault, for checking the plugin by eye.
#
# John, 2026-10-30: "Just set up your own test vault in temp or whatever, right? That's what you should
# be working out for tests." (and earlier: "we want to use the smallest testing surface we can"; the VM
# is for what this cannot show). The vault lives in /private/tmp and is rebuilt from the notes in
# test/vault/*.md.fixture (kept as .fixture so no real vault ever lists them as review work). It never
# touches any of John's vaults or windows: every call names this vault, and the window it opens is the
# only one it drives.
#
#   scripts/test-vault.sh up            build, reset the notes, open the vault, load the build, enable it
#   scripts/test-vault.sh open <note>   open a note (e.g. approve-open.md) with the review panel beside it
#   scripts/test-vault.sh shot <name> [dir]   screenshot the vault window to <dir>/<name>.png
#                                       (default dir dev-docs/runs/<today>-test-vault); look at it
#   scripts/test-vault.sh eval '<js>'   run JavaScript in the vault window (`app` is Obsidian's)
#   scripts/test-vault.sh down          close the vault window (the folder and its registration stay)
#
# Every write goes through the running app: `obsidian-vault-setup open` registers and opens the folder,
# and the build is written with Obsidian's own vault adapter from inside that window. The notes are
# plain files in the vault folder, reset on each `up`. UNDOCUMENTED: getCurrentWindow().capturePage.
set -euo pipefail
REPO=$(cd "$(dirname "$0")/.." && pwd)
V=${TEST_VAULT:-/private/tmp/obsidian-track-changes-test-vault}
NAME=$(basename "$V")

ev() { timeout 40 obsidian vault="$NAME" eval code="$1" 2>&1 | sed -n 's/^=> //p'; }
answers() { [ "$(ev "'alive'")" = "alive" ]; }
jsq() { python3 -c 'import json,sys;print(json.dumps(sys.argv[1]))' "$1"; }

case "${1:-}" in
  up)
    (cd "$REPO" && npm run build >/dev/null)
    mkdir -p "$V"
    find "$V" -maxdepth 1 -name '*.md' -exec rm -f {} +
    for f in "$REPO"/test/vault/*.md.fixture; do cp "$f" "$V/$(basename "$f" .fixture)"; done
    if ! answers; then
      obsidian-vault-setup open "$V" >/dev/null 2>&1 || true
      gui-release >/dev/null 2>&1 || true   # the open raises the takeover banner; the window is up now
      for _ in $(seq 1 20); do answers && break; sleep 2; done
      answers || { echo "test vault window did not open: $V" >&2; exit 1; }
    fi
    ev "(async()=>{const fs=require('fs');const d='.obsidian/plugins/track-changes';if(!(await app.vault.adapter.exists(d)))await app.vault.adapter.mkdir(d);for(const f of ['main.js','manifest.json','styles.css'])await app.vault.adapter.write(d+'/'+f,fs.readFileSync($(jsq "$REPO/")+f,'utf8'));window.__tvw='written'})();'k'" >/dev/null
    sleep 2
    ev "window.__tvl=null;(async()=>{await app.plugins.loadManifests();if(!app.plugins.isEnabled())await app.plugins.setEnable(true);if(app.plugins.enabledPlugins.has('track-changes'))await app.plugins.disablePlugin('track-changes');await app.plugins.enablePluginAndSave('track-changes');const p=app.plugins.plugins['track-changes'];p.settings.localAuthorName='Test Reviewer';await p.saveSettings();window.__tvl='loaded '+p.manifest.version})();'k'" >/dev/null
    for _ in $(seq 1 15); do r=$(ev "String(window.__tvl)"); [ "$r" != "null" ] && break; sleep 1; done
    ev "window.__shot=async(p)=>{const img=await require('electron').remote.getCurrentWindow().webContents.capturePage();require('fs').writeFileSync(p,img.toPNG());return p};window.__open=async(n)=>{await app.workspace.getLeaf(false).openFile(app.vault.getAbstractFileByPath(n));app.commands.executeCommandById('track-changes:open-review-panel');app.workspace.rightSplit.expand();app.workspace.leftSplit.collapse();return n};'helpers'" >/dev/null
    echo "test vault up: $V ($r, built from $(git -C "$REPO" rev-parse --short HEAD))"
    ;;
  open)
    ev "window.__open($(jsq "${2:?note}"))" >/dev/null; sleep 1.5; echo "opened ${2}" ;;
  shot)
    DIR=${3:-$REPO/dev-docs/runs/$(date +%F)-test-vault}; mkdir -p "$DIR"
    ev "window.__shot($(jsq "$DIR/${2:?name}.png"))" >/dev/null; sleep 1
    [ -f "$DIR/$2.png" ] && echo "$DIR/$2.png" || { echo "no screenshot written" >&2; exit 1; } ;;
  eval)
    ev "${2:?js}" ;;
  down)
    ev "setTimeout(()=>require('electron').remote.getCurrentWindow().close(),300);'closing'" >/dev/null || true
    echo "test vault window closed" ;;
  *)
    sed -n '2,20p' "$0"; exit 2 ;;
esac
