#!/bin/bash
# update-in-windows.sh <vault-path>... — update the Track Changes fork in each OPEN vault without
# raising any window: from whichever vault window answers the obsidian CLI, find the target
# vault's BrowserWindow by its basePath and run the BRAT update inside that window's renderer
# (remote webContents.executeJavaScript). Works with the screen locked. Same app surfaces as
# install-fork-v2.sh (UNDOCUMENTED-API brat-addplugin; Obsidian's own plugin enable/disable).
#
# `obsidian eval` prints nothing when the awaited code takes more than ~1.5 s, so every slow
# step is fire-and-forget into a window global, then polled with a quick eval.
set -u
WANT=${WANT:-2.3.0-jtr.7}
cd /
ev() { timeout 40 obsidian eval code="$1" 2>&1 | sed -n 's/^=> //p' | head -1; }
log() { printf '%s %s\n' "$(date +%H:%M:%S)" "$*"; }
jsq() { python3 -c 'import json,sys;print(json.dumps(sys.argv[1]))' "$1"; }
# Run JS in the window whose basePath is $1 (async in the front window); result lands in window.__tcr.
remote() {
  ev "window.__tcr=null; (async()=>{try{ const ws=require('electron').remote.BrowserWindow.getAllWindows(); for(const w of ws){ let bp=''; try{ bp=await w.webContents.executeJavaScript('(typeof app!==\"undefined\"&&app.vault)?app.vault.adapter.basePath:\"\"') }catch(e){} if(bp===$(jsq "$1")){ window.__tcr=String(await w.webContents.executeJavaScript($(jsq "$2"))); return } } window.__tcr='no window' }catch(e){ window.__tcr='ERR '+e.message }})(); 'kicked'" >/dev/null
  local i r
  for i in $(seq 1 40); do r=$(ev "window.__tcr===null?'__pending':window.__tcr"); [ "$r" != "__pending" ] && [ -n "$r" ] && { echo "$r"; return; }; sleep 1; done
  echo "timeout"
}
UPDATE='window.__tc="running";(async()=>{try{
  if(!app.plugins.manifests["obsidian42-brat"]){ const m=await (await fetch("https://raw.githubusercontent.com/TfTHacker/obsidian42-brat/HEAD/manifest.json")).json(); await app.plugins.installPlugin("TfTHacker/obsidian42-brat", m.version, m); await app.plugins.loadManifests(); }
  if(!app.plugins.enabledPlugins.has("obsidian42-brat")) await app.plugins.enablePluginAndSave("obsidian42-brat");
  for(let i=0;i<30&&!app.plugins.plugins["obsidian42-brat"];i++) await new Promise(r=>setTimeout(r,500));
  const b=app.plugins.plugins["obsidian42-brat"]; if(!b) throw new Error("BRAT not loaded");
  await b.betaPlugins.addPlugin("johntrandall/obsidian-track-changes",false,false,false,"",false,false);
  await app.plugins.loadManifests();
  if(app.plugins.enabledPlugins.has("track-changes")){ await app.plugins.disablePlugin("track-changes"); await app.plugins.enablePlugin("track-changes"); }
  await app.plugins.disablePluginAndSave("obsidian42-brat");
  window.__tc="ok manifest "+(app.plugins.manifests["track-changes"]?.version)+" running "+(app.plugins.plugins["track-changes"]?.manifest.version??"off");
}catch(e){ window.__tc="ERR "+e.message }})(); "started"'
for V in "$@"; do
  RP=$(python3 -c "import os,sys;print(os.path.realpath(sys.argv[1]))" "$V"); NAME=$(basename "$V")
  HAVE=$(remote "$RP" "app.plugins.manifests['track-changes']?.version ?? 'none'")
  case "$HAVE" in
    "no window"|timeout|ERR*) log "SKIP $NAME: $HAVE"; continue;;
    "$WANT") remote "$RP" "(async()=>{await app.plugins.disablePluginAndSave('obsidian42-brat'); return 1})()" >/dev/null; log "OK   $NAME: already $WANT"; continue;;
  esac
  remote "$RP" "$UPDATE" >/dev/null
  R=running
  for i in $(seq 1 40); do R=$(remote "$RP" "window.__tc"); case "$R" in running) sleep 3;; *) break;; esac; done
  log "$([[ $R == ok* ]] && echo DONE || echo FAIL) $NAME: $R (was $HAVE)"
done
