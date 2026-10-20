#!/bin/bash
# vm-test.sh — a disposable Obsidian in a local Tart VM for checking this plugin by eye,
# without touching the host's Obsidian, its vaults or its windows.
#
#   scripts/vm-test.sh up        clone (first time) and boot the VM, install Obsidian, make the
#                                test vault, link the dev build in, open the vault
#   scripts/vm-test.sh reload    after `npm run build`: reload the plugin in the running vault
#   scripts/vm-test.sh fixture   reset the fixture note (test/fixtures/vm-fixture.md) in the vault
#   scripts/vm-test.sh shot [f]  screenshot the VM screen to <f> (default /tmp/obsidian-vm.png)
#   scripts/vm-test.sh eval JS   run JS in the vault window through Obsidian's CLI in the VM
#   scripts/vm-test.sh ssh ...   a command in the VM (login shell, TCC grants)
#   scripts/vm-test.sh vnc       open Screen Sharing to watch it
#   scripts/vm-test.sh stop      stop the VM (disk persists); `destroy` deletes it
#
# Requires the `tart-vm` wrapper and the macos-15.7-l2-dev golden image (tart-vm-management
# skill). The repo is shared into the VM read-write over VirtioFS at /Volumes/My Shared
# Files/code, so the plugin folder in the test vault is a symlink to the host's build output:
# `npm run build` on the host, `reload` in the VM. The vault lives only in the VM; copying
# main.js into its .obsidian/plugins is the standard plugin-dev loop and is the whole point of
# the VM (the host's vaults are never written this way).
set -euo pipefail
VM=${VM:-obsidian-track-changes-dev}
IMAGE=${IMAGE:-macos-15.7-l2-dev}
HOST_REPO=$(cd "$(dirname "$0")/.." && pwd)
VAULT='/Users/admin/tc-test-vault'
CODE='/Volumes/My Shared Files/code'

vm() { tart-vm ssh "$VM" "$*"; }
need_running() { tart-vm status 2>/dev/null | grep -q "$VM" || { echo "VM $VM is not running; run: $0 up" >&2; exit 1; }; }

case "${1:-}" in
  up)
    tart-vm start "$VM" --from "$IMAGE" --as local-dev --dir "code:$HOST_REPO"
    vm "which obsidian >/dev/null 2>&1 || brew install --cask obsidian"
    vm "mkdir -p '$VAULT'"
    "$0" fixture
    vm "open -a Obsidian '$VAULT'"
    sleep 12
    # First launch: the folder may need to be opened as a vault by hand (Screen Sharing: `vnc`).
    # Once a vault window exists, Obsidian's CLI answers for it.
    vm "obsidian plugins:restrict off" || true
    vm "mkdir -p '$VAULT/.obsidian/plugins' && ln -sfn '$CODE' '$VAULT/.obsidian/plugins/track-changes'"
    vm "obsidian plugin:enable id=track-changes" || true
    vm "obsidian eval code=\"(async()=>{const p=app.plugins.plugins['track-changes']; if(!p) return 'plugin not loaded yet'; p.settings.localAuthorName='Test Reviewer'; p.settings.clickMarksToOpenPanel=true; await p.saveSettings(); return 'settings saved'})()\"" || true
    echo "VM up. Watch it: $0 vnc   Screenshot: $0 shot"
    ;;
  reload)
    need_running
    vm "obsidian eval code=\"(async()=>{await app.plugins.disablePlugin('track-changes'); await app.plugins.enablePlugin('track-changes'); return 'reloaded '+app.plugins.plugins['track-changes']?.manifest.version})()\""
    ;;
  fixture)
    need_running
    tart-vm ssh "$VM" "cat > '$VAULT/fixture.md'" < "$HOST_REPO/test/fixtures/vm-fixture.md"
    echo "fixture.md written"
    ;;
  shot)
    need_running
    OUT=${2:-/tmp/obsidian-vm.png}
    vm "screencapture -x /tmp/shot.png"
    tart-vm scp "$VM:/tmp/shot.png" "$OUT" 2>/dev/null || scp -i ~/.ssh/tart_vm_key -o StrictHostKeyChecking=no "admin@$(tart-vm ip "$VM"):/tmp/shot.png" "$OUT"
    echo "$OUT"
    ;;
  eval)
    need_running
    shift
    vm "obsidian eval code=$(printf '%q' "$*")"
    ;;
  ssh)
    shift
    tart-vm ssh "$VM" "$@"
    ;;
  vnc)
    open "vnc://admin:admin@$(tart-vm ip "$VM")"
    ;;
  stop)
    tart-vm stop "$VM"
    ;;
  destroy)
    tart-vm destroy "$VM"
    ;;
  *)
    sed -n '2,15p' "$0"
    exit 2
    ;;
esac
