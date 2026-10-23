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
#   scripts/vm-test.sh mobile on|off   switch the vault window to Obsidian's mobile emulation
#                                (app.emulateMobile; the window reloads; it persists until `off`)
#   scripts/vm-test.sh smoke-mobile [dir]   mobile on, then the review-panel smoke test
#                                (scripts/vm-mobile-smoke.js, plan test/fixtures/vm-mobile-smoke.json)
#                                at 1024x768 and 834x1194; results.json and a screenshot per step
#                                go to [dir] (default dev-docs/runs/<today>-mobile/); exit 1 on FAIL
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
    # Bounded in the guest: a CLI that finds no answering vault window can hang for good.
    vm "perl -e 'alarm shift; exec @ARGV' ${EVAL_TIMEOUT:-60} obsidian eval code=$(printf '%q' "$*")"
    ;;
  mobile)
    need_running
    case "${2:-}" in
      on) WANT=true ;;
      off) WANT=false ;;
      *) echo "usage: $0 mobile on|off" >&2; exit 2 ;;
    esac
    # emulateMobile reloads the window, so schedule it and return before the reload.
    "$0" eval "(()=>{ if (app.isMobile === $WANT) return 'already isMobile=' + app.isMobile; setTimeout(() => app.emulateMobile($WANT), 300); return 'switching to isMobile=$WANT'; })()" || true
    sleep 10
    STATE=$("$0" eval "'isMobile=' + app.isMobile + ' plugin=' + !!app.plugins.plugins['track-changes']" 2>&1 || true)
    echo "$STATE"
    case "$STATE" in
      *"isMobile=$WANT"*) ;;
      *) echo "mobile $2: the vault window did not answer with isMobile=$WANT (see above)." >&2
         echo "If Obsidian's CLI is off or no vault is open, open the vault once through Screen Sharing ($0 vnc); see README, Testing by eye in a VM." >&2
         exit 1 ;;
    esac
    ;;
  smoke-mobile)
    need_running
    RUN=${2:-dev-docs/runs/$(date +%Y-%m-%d)-mobile}
    mkdir -p "$HOST_REPO/$RUN"
    RESULTS="$HOST_REPO/$RUN/results.json"
    RUN_ID="smoke-$(date +%s)"
    "$0" fixture
    "$0" mobile on
    # The smoke runs inside the window and writes results.json through the VirtioFS share;
    # the CLI call only starts it.
    KICK=$("$0" eval "(()=>{ const s = require('fs').readFileSync('$CODE/scripts/vm-mobile-smoke.js', 'utf8'); (0, eval)(s)(app, { root: '$CODE', outDir: '$CODE/$RUN', runId: '$RUN_ID' }).catch((e) => console.error('smoke', e)); return 'smoke started'; })()" 2>&1 || true)
    echo "$KICK"
    case "$KICK" in *"smoke started"*) ;; *) echo "smoke-mobile: could not start the smoke in the vault window" >&2; exit 1 ;; esac
    for _ in $(seq 1 120); do
      if [ -f "$RESULTS" ] && node -e "const r=require(process.argv[1]); process.exit(r.runId===process.argv[2] && r.done ? 0 : 1)" "$RESULTS" "$RUN_ID" 2>/dev/null; then
        break
      fi
      sleep 5
    done
    node -e '
      const r = require(process.argv[1]);
      if (r.runId !== process.argv[2] || !r.done) { console.error("smoke did not finish (no results.json for " + process.argv[2] + ")"); process.exit(1); }
      for (const c of r.checks) if (c.status !== "pass") console.log(`${c.status.padEnd(11)} ${c.size} / ${c.step} / ${c.name}
            expected ${JSON.stringify(c.expected)}
            actual   ${JSON.stringify(c.actual)}`);
      for (const e of r.errors) console.log("error       " + e);
      console.log(JSON.stringify({ environment: r.environment, ...r.summary }));
      process.exit(r.summary.fail || r.summary.errors ? 1 : 0);
    ' "$RESULTS" "$RUN_ID"
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
    sed -n '2,20p' "$0"
    exit 2
    ;;
esac
