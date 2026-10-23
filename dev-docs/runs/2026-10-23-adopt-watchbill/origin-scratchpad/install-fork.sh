#!/bin/bash
# install-fork.sh <vault-path>... — put the Track Changes fork release into each vault through
# Obsidian's own surfaces only (CLI + BRAT's addPlugin inside the app). Never touches .obsidian/.
# The CLI answers for the FRONTMOST window whatever vault= says (vault-setup README gotcha), so each
# vault is brought to the front and checked by its basePath before anything is written.
set -u
REPO=johntrandall/obsidian-track-changes
WANT=${WANT:-2.3.0-jtr.4}
AUTHOR="John Randall"
cd /

ev() { timeout 25 obsidian eval code="$1" 2>&1 | sed -n 's/^=> //p' | head -1; }
log() { printf '%s %s\n' "$(date +%H:%M:%S)" "$*"; }

front_is() {  # $1 = realpath of the vault
  local bp; bp=$(ev "app.vault.adapter.basePath")
  [ "$(python3 -c "import os,sys;print(os.path.realpath(sys.argv[1]))" "$bp")" = "$1" ]
}

bring_front() {  # $1 vault path, $2 realpath
  local i
  for i in 1 2 3 4; do
    if [ -d "$1/.obsidian" ] && front_is "$2"; then return 0; fi
    open -a Obsidian "$1"; sleep 4
  done
  front_is "$2"
}

open_closed() {  # $1 vault path (absolute). Runs the vault-open IPC from whatever window is in front.
  ev "electron.ipcRenderer.sendSync('vault-open','$1',false); 'sent'" >/dev/null
  sleep 8
}

for V in "$@"; do
  RP=$(python3 -c "import os,sys;print(os.path.realpath(sys.argv[1]))" "$V")
  NAME=$(basename "$V")
  log "=== $NAME ($V)"
  if ! bring_front "$V" "$RP"; then
    log "  not in front after open -a; trying vault-open IPC (closed vault)"
    open_closed "$V"
    if ! bring_front "$V" "$RP"; then log "  FAIL: could not bring $NAME to the front; skipped"; continue; fi
  fi
  WAS_ON=$(ev "app.plugins.enabledPlugins.has('track-changes')")
  HAD=$(ev "app.plugins.manifests['track-changes']?.version ?? 'none'")
  log "  front ok; track-changes $HAD (enabled=$WAS_ON)"
  if [ "$HAD" = "$WANT" ]; then log "  already $WANT; nothing to do"; continue; fi

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
  if [ "$(ev "!!app.plugins.plugins['obsidian42-brat']")" != "true" ]; then log "  FAIL: BRAT not loaded; skipped"; continue; fi

  # UNDOCUMENTED-API(brat-addplugin): BetaPlugins.addPlugin(repo, updatePluginFiles, seeIfUpdatedOnly,
  # reportIfNotUpdated, specifyVersion, forceReinstall, enableAfterInstall) — BRAT 2.2.0 main.js.
  ev "(async()=>{const b=app.plugins.plugins['obsidian42-brat']; const ok=await b.betaPlugins.addPlugin('$REPO',false,false,false,'',false,false); return String(ok)})()" >/dev/null
  GOT=none
  for i in $(seq 1 30); do
    GOT=$(ev "(async()=>{await app.plugins.loadManifests(); return app.plugins.manifests['track-changes']?.version ?? 'none'})()")
    [ "$GOT" = "$WANT" ] && break; sleep 3
  done
  if [ "$GOT" != "$WANT" ]; then log "  FAIL: manifest is $GOT after addPlugin; BRAT left on for inspection"; continue; fi

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
done
