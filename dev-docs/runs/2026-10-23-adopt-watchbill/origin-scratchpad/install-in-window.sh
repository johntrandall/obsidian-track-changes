#!/bin/bash
# install-in-window.sh <vault-path> <window-title-prefix> [brat-off-only]
# For a vault whose window the obsidian CLI never answers for (opened by IPC this session): run the
# install INSIDE that window's renderer via remote webContents.executeJavaScript from a live vault
# window (job-hunt). Same app surfaces as the CLI's own plugin:install / plugins:restrict / BRAT:
# UNDOCUMENTED-API(plugin-install): app.plugins.installPlugin(repo, version, manifest) — what the
#   community-plugin browser and the CLI's plugin:install call; UNDOCUMENTED-API(plugins-restrict):
#   app.plugins.setEnable(true) — the CLI's plugins:restrict off; UNDOCUMENTED-API(brat-addplugin) and
#   UNDOCUMENTED-API(plugin-settings) as in obsidian-vault-setup. Nothing under .obsidian/ is written
#   by this script; Obsidian, BRAT and the plugin write their own files. The window is closed after.
set -u
V=$1; T=$2; MODE=${3:-install}
WANT=2.3.0-jtr.4
cd /
ev() { timeout 25 obsidian eval code="$1" 2>&1 | sed -n 's/^=> //p' | head -1; }
inwin() {  # $1 = JS expression evaluated in the target window; result returned through the live window
  ev "(async()=>{const w=require('electron').remote.BrowserWindow.getAllWindows().find(w=>w.getTitle().startsWith('$T')); if(!w) return 'no window'; try{ return String(await w.webContents.executeJavaScript($(python3 -c 'import json,sys;print(json.dumps(sys.argv[1]))' "$1"))) }catch(e){ return 'ERR '+e.message }})()"
}
log() { printf '%s %s\n' "$(date +%H:%M:%S)" "$*"; }
open -a Obsidian ~/job-hunt; sleep 3
if [ "$(inwin "app.vault.adapter.basePath")" != "$V" ]; then
  log "opening $V"
  ev "electron.ipcRenderer.sendSync('vault-open','$V',false); 'sent'" >/dev/null; sleep 10
  open -a Obsidian ~/job-hunt; sleep 3
fi
log "target basePath: $(inwin "app.vault.adapter.basePath")"
if [ "$MODE" = "brat-off" ]; then
  log "brat off: $(inwin "(async()=>{await app.plugins.disablePluginAndSave('obsidian42-brat'); return 'disabled, enabled='+app.plugins.enabledPlugins.has('obsidian42-brat')})()")"
else
  inwin "window.__tc='running'; (async()=>{try{
    if(!app.plugins.isEnabled()) await app.plugins.setEnable(true);
    if(!app.plugins.manifests['obsidian42-brat']){ const m=await (await fetch('https://raw.githubusercontent.com/TfTHacker/obsidian42-brat/HEAD/manifest.json')).json(); await app.plugins.installPlugin('TfTHacker/obsidian42-brat', m.version, m); await app.plugins.loadManifests(); }
    if(!app.plugins.enabledPlugins.has('obsidian42-brat')) await app.plugins.enablePluginAndSave('obsidian42-brat');
    const b=app.plugins.plugins['obsidian42-brat']; if(!b) throw new Error('BRAT not loaded');
    await b.betaPlugins.addPlugin('johntrandall/obsidian-track-changes',false,false,false,'',false,false);
    await app.plugins.loadManifests();
    if(!app.plugins.enabledPlugins.has('track-changes')) await app.plugins.enablePluginAndSave('track-changes');
    const p=app.plugins.plugins['track-changes']; if(p){ p.settings.localAuthorName='John Randall'; p.settings.clickMarksToOpenPanel=true; await p.saveSettings(); }
    await app.plugins.disablePluginAndSave('obsidian42-brat');
    window.__tc='ok manifest '+app.plugins.manifests['track-changes']?.version+' running '+(app.plugins.plugins['track-changes']?.manifest.version);
  }catch(e){ window.__tc='ERR '+e.message }})(); 'started'" >/dev/null
  R=running
  for i in $(seq 1 40); do R=$(inwin "window.__tc"); case "$R" in running) sleep 3;; *) break;; esac; done
  log "result: $R"
fi
sleep 4   # let the saves land
log "on disk: $(python3 -c "
import json,os
p='$V'; m=os.path.join(p,'.obsidian/plugins/track-changes/manifest.json')
cp=json.load(open(os.path.join(p,'.obsidian/community-plugins.json'))) if os.path.exists(os.path.join(p,'.obsidian/community-plugins.json')) else []
print(json.load(open(m))['version'] if os.path.exists(m) else '-', 'tc on' if 'track-changes' in cp else 'tc off', 'brat ON' if 'obsidian42-brat' in cp else 'brat off')")"
log "close: $(ev "(()=>{const ws=require('electron').remote.BrowserWindow.getAllWindows().filter(w=>w.getTitle().startsWith('$T')); ws.forEach(w=>w.close()); return ws.length+' closed'})()")"
