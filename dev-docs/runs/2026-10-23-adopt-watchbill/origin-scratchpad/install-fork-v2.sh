#!/bin/bash
# install-fork-v2.sh <vault-path>... — put the Track Changes fork release into each vault through
# Obsidian's own surfaces only (CLI + BRAT's addPlugin inside the app). Never touches .obsidian/.
# The CLI answers for the FRONTMOST window whatever vault= says (vault-setup README gotcha), so each
# vault is brought to the front and checked by its basePath before anything is written.
# A vault that was closed is opened with the vault-open IPC and CLOSED AGAIN right after
# (John, 2026-10-20: "close them as you go, or we will get ram-exhausted").
set -u
REPO=johntrandall/obsidian-track-changes
WANT=${WANT:-2.3.0-jtr.4}
AUTHOR="John Randall"
cd /

ev() { timeout 25 obsidian eval code="$1" 2>&1 | sed -n 's/^=> //p' | head -1; }
log() { printf '%s %s\n' "$(date +%H:%M:%S)" "$*"; }
real() { python3 -c "import os,sys;print(os.path.realpath(sys.argv[1]))" "$1"; }

front_is() { [ "$(real "$(ev "app.vault.adapter.basePath")")" = "$1" ]; }

bring_front() {  # $1 vault path, $2 realpath; open -a only raises a window that already exists
  local i
  for i in 1 2 3; do
    front_is "$2" && return 0
    open -a Obsidian "$1"; sleep 4
  done
  front_is "$2"
}

OPENED=0
open_closed() {  # $1 vault path. UNDOCUMENTED-API(vault-open-ipc), sent from whatever window is in front.
  ev "electron.ipcRenderer.sendSync('vault-open','$1',false); 'sent'" >/dev/null
  OPENED=1
  sleep 8
}

close_front() {  # $1 realpath: close the window we opened, only if it is still the one in front
  if front_is "$1"; then
    ev "require('electron').remote.getCurrentWindow().close(); 'closing'" >/dev/null
    sleep 3
    log "  closed the window again"
  else
    log "  WARNING: another window came to the front; left $1 open"
  fi
}

do_vault() {  # $1 vault path, $2 realpath, $3 name
  local V=$1 RP=$2 NAME=$3 WAS_ON HAD GOT RUN i
  WAS_ON=$(ev "app.plugins.enabledPlugins.has('track-changes')")
  HAD=$(ev "app.plugins.manifests['track-changes']?.version ?? 'none'")
  log "  front ok; track-changes $HAD (enabled=$WAS_ON)"
  if [ "$HAD" = "$WANT" ]; then
    timeout 25 obsidian plugin:disable id=obsidian42-brat >/dev/null 2>&1
    log "  already $WANT; nothing to do (BRAT off)"; return 0
  fi
  timeout 25 obsidian plugins:restrict off >/dev/null 2>&1
  if [ "$(ev "Object.keys(app.plugins.manifests).includes('obsidian42-brat')")" != "true" ]; then
    log "  installing BRAT"
    timeout 60 obsidian plugin:install id=obsidian42-brat enable >/dev/null 2>&1
    for i in $(seq 1 20); do
      [ "$(ev "Object.keys(app.plugins.manifests).includes('obsidian42-brat')")" = "true" ] && break; sleep 3
    done
  fi
  timeout 25 obsidian plugin:enable id=obsidian42-brat >/dev/null 2>&1
  for i in $(seq 1 10); do
    [ "$(ev "!!app.plugins.plugins['obsidian42-brat']")" = "true" ] && break; sleep 2
  done
  if [ "$(ev "!!app.plugins.plugins['obsidian42-brat']")" != "true" ]; then log "  FAIL: BRAT not loaded; skipped"; return 1; fi

  # UNDOCUMENTED-API(brat-addplugin): BetaPlugins.addPlugin(repo, updatePluginFiles, seeIfUpdatedOnly,
  # reportIfNotUpdated, specifyVersion, forceReinstall, enableAfterInstall) — BRAT 2.2.0 main.js.
  ev "(async()=>{const b=app.plugins.plugins['obsidian42-brat']; const ok=await b.betaPlugins.addPlugin('$REPO',false,false,false,'',false,false); return String(ok)})()" >/dev/null
  GOT=none
  for i in $(seq 1 30); do
    GOT=$(ev "(async()=>{await app.plugins.loadManifests(); return app.plugins.manifests['track-changes']?.version ?? 'none'})()")
    [ "$GOT" = "$WANT" ] && break; sleep 3
  done
  if [ "$GOT" != "$WANT" ]; then log "  FAIL: manifest is $GOT after addPlugin; BRAT left on for inspection"; return 1; fi

  if [ "$WAS_ON" = "true" ]; then
    ev "(async()=>{await app.plugins.disablePlugin('track-changes'); await app.plugins.enablePlugin('track-changes'); return 'reloaded'})()" >/dev/null
  elif [ "$HAD" = "none" ]; then
    timeout 25 obsidian plugin:enable id=track-changes >/dev/null 2>&1
    sleep 2
    # UNDOCUMENTED-API(plugin-settings): the plugin's own settings + saveSettings().
    ev "(async()=>{const p=app.plugins.plugins['track-changes']; if(!p) return 'not loaded'; p.settings.localAuthorName='$AUTHOR'; p.settings.clickMarksToOpenPanel=true; await p.saveSettings(); return 'settings saved'})()" | sed 's/^/  /'
  fi
  timeout 25 obsidian plugin:disable id=obsidian42-brat >/dev/null 2>&1
  RUN=$(ev "app.plugins.plugins['track-changes']?.manifest.version ?? 'off'")
  log "  DONE: manifest $GOT, running $RUN, BRAT off"
}

for V in "$@"; do
  RP=$(real "$V"); NAME=$(basename "$V"); OPENED=0
  log "=== $NAME ($V)"
  if ! bring_front "$V" "$RP"; then
    log "  not open; opening it (vault-open IPC)"
    open_closed "$V"
    if ! bring_front "$V" "$RP"; then log "  FAIL: could not bring $NAME to the front; skipped"; continue; fi
  fi
  do_vault "$V" "$RP" "$NAME"
  [ "$OPENED" = 1 ] && close_front "$RP"
done
