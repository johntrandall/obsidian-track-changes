#!/bin/bash
# update-open-vaults.sh <vault-path>... — the founding session's update-in-windows.sh (2026-10-23), changed
# by trackchg-architect-ho2 on 2026-10-30: BRAT is left in the state it was found (the original always
# switched it off, which stopped BRAT's update-at-startup), and a vault without the plugin is skipped.
# Raises no window; runs inside each OPEN vault's renderer through Obsidian's own plugin API.
set -u
WANT=${WANT:-2.3.0-jtr.9}
cd /
ev() { timeout 40 obsidian eval code="$1" 2>&1 | sed -n 's/^=> //p' | head -1; }
log() { printf '%s %s\n' "$(date +%H:%M:%S)" "$*"; }
jsq() { python3 -c 'import json,sys;print(json.dumps(sys.argv[1]))' "$1"; }
remote() {
  ev "window.__tcr=null; (async()=>{try{ const ws=require('electron').remote.BrowserWindow.getAllWindows(); for(const w of ws){ let bp=''; try{ bp=await Promise.race([w.webContents.executeJavaScript('(typeof app!==\"undefined\"&&app.vault)?app.vault.adapter.basePath:\"\"'), new Promise(r=>setTimeout(()=>r(''),3000))]) }catch(e){} if(bp===$(jsq "$1")){ window.__tcr=String(await w.webContents.executeJavaScript($(jsq "$2"))); return } } window.__tcr='no window' }catch(e){ window.__tcr='ERR '+e.message }})(); 'kicked'" >/dev/null
  local i r
  for i in $(seq 1 40); do r=$(ev "window.__tcr===null?'__pending':window.__tcr"); [ "$r" != "__pending" ] && [ -n "$r" ] && { echo "$r"; return; }; sleep 1; done
  echo "timeout"
}
UPDATE='window.__tc="running";(async()=>{try{
  const bratWasOn=app.plugins.enabledPlugins.has("obsidian42-brat");
  if(!app.plugins.manifests["obsidian42-brat"]) throw new Error("BRAT not installed");
  if(!bratWasOn) await app.plugins.enablePluginAndSave("obsidian42-brat");
  for(let i=0;i<30&&!app.plugins.plugins["obsidian42-brat"];i++) await new Promise(r=>setTimeout(r,500));
  const b=app.plugins.plugins["obsidian42-brat"]; if(!b) throw new Error("BRAT not loaded");
  await b.betaPlugins.addPlugin("johntrandall/obsidian-track-changes",false,false,false,"",false,false);
  await app.plugins.loadManifests();
  if(app.plugins.enabledPlugins.has("track-changes")){ await app.plugins.disablePlugin("track-changes"); await app.plugins.enablePlugin("track-changes"); }
  if(!bratWasOn) await app.plugins.disablePluginAndSave("obsidian42-brat");
  window.__tc="ok manifest "+(app.plugins.manifests["track-changes"]?.version)+" running "+(app.plugins.plugins["track-changes"]?.manifest.version??"off")+" brat "+(bratWasOn?"on":"off");
}catch(e){ window.__tc="ERR "+e.message }})(); "started"'
for V in "$@"; do
  RP=$(python3 -c "import os,sys;print(os.path.realpath(sys.argv[1]))" "$V"); NAME=$(basename "$V")
  HAVE=$(remote "$RP" "app.plugins.manifests['track-changes']?.version ?? 'none'")
  case "$HAVE" in
    "no window"|timeout|ERR*|none) log "SKIP $NAME: $HAVE"; continue;;
    "$WANT") log "OK   $NAME: already $WANT"; continue;;
  esac
  remote "$RP" "$UPDATE" >/dev/null
  R=running
  for i in $(seq 1 40); do R=$(remote "$RP" "window.__tc"); case "$R" in running) sleep 3;; *) break;; esac; done
  log "$([[ $R == ok* ]] && echo DONE || echo FAIL) $NAME: $R (was $HAVE)"
done
