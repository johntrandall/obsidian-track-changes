# watch.md — what the obsidian-track-changes architect watches while dormant

Shape: software project (`watchbill systems`: obsidian-track-changes, doorbell architect, intake `intake/`). The software does the work: the Obsidian plugin fork runs in John's vaults; the architect wakes for a message, an intake note, the human, or a probe below failing.

## Probes (run on waking, and by a bounded watch when one is armed)

| Probe | Command | Pass |
|---|---|---|
| Suite on the integration branch | `cd ~/dev/obsidian-track-changes && git checkout feat/bulk-accept && npm run typecheck && npm test` | all `ok`, no `FAIL` |
| Build | `npm run build` | exit 0 |
| Installed vs released, every open vault | `scripts/vault-versions.sh` (to write: the python one-liner from the founding session that reads each registered vault's `.obsidian/plugins/track-changes/manifest.json` and compares to `gh release list` latest `*-jtr.*`) | every open vault with the plugin on runs the latest fork build |
| Agent tool contract | `obsidian-track-changes-agent --version` ≥ 0.2.0; `node test/approval.test.mjs` (shared vectors) | pass |
| Consumer: watchbill | `watchbill status ~/dev/claude-plugin-watchbill` shows `drift` wired without error (from watchbill 0.10.52) | no error naming this tool |
| Mobile harness | `npm run test:webkit` and `scripts/vm-test.sh smoke-mobile` (when the builder lands them) | pass |

## How John is told

A failed probe: one message in the architect's tab and, if nobody is in that tab, one PushNotification; silence while green. Rollouts raise no windows while his screen is locked (use `update-in-windows`, see the README).

## Exit condition

None yet: the system is young. Revisit after the upstream PR decision (2026-10-27) and the mobile harness landing.

## Relief log

- 2026-10-23 12:08 EDT: `trackchg-architect` (session 988b396b-f824-464e-83db-39e5a05961e0) relieved the founding session `obsidian-track-changes-df` (8a6e4f5e). The origin ran no board watcher and no Monitor ("I had no watcher running … nothing to stop", its message to trackchg-architect, 12:08). Recorded for it: watcher stopped. The receiver arms `watchbill decisions watch --system obsidian-track-changes` from here.
- 2026-10-25 13:32 EDT, trackchg-architect (architect, session 988b396b): 2026-10-25 13:3x: intake 8deb90e (revise hit the wrong mark while John reviewed): designed stable mark ids + stale-number guard, dev-docs/runs/2026-10-25-stable-mark-ids/design.md; building in the agent tool as 0.3.0
- 2026-10-25 23:24 EDT, trackchg-architect (architect, session 988b396b): 2026-10-25 23:4x: rollovers on every button landed 5398bd5 (John's chat instruction, card 2026-10-25-rollover-help-on-every-button); action-log card presented to John; jtr.9 release still waits on his yes
- 2026-10-26 13:48 EDT, trackchg-architect (architect, session 988b396b): 2026-10-26 14:0x: agent tool 0.4.0 (ambiguity skill+verb, build/ambiguity 82be6fe) and 0.4.1 (withdraw, build/withdraw 4347f83) built and verified; both wait on John's cards before merging to main
- 2026-10-26 14:13 EDT, trackchg-architect (architect, session 988b396b): 2026-10-26 14:0x: agent tool 0.3.1 (approve --at validated) live, pushed umbridge; both pending branches carry it (build/ambiguity 0c29291, build/withdraw 3b1d560). Slip: I merged main into a branch in the tool's live working tree, which ~/.local/bin links; conflict markers broke the tool for about a minute until the merge was aborted. Rule from now: never check out or merge in that tree; branch work goes in a scratch worktree.
- 2026-10-27 21:31 EDT, trackchg-architect (architect, session 988b396b): 2026-10-27 21:3x: golden VM macos-15.7-l2-dev found stopped (disk last written 2026-10-25 03:03; host rebooted 2026-10-27 13:35); the grants-wait probe died with it. Not rebooted unasked (host load average 52); boot offered on the grants card. The tailscale serve 5901 forward still points at 192.168.64.8 and is harmless while the VM is off.
- 2026-10-30 00:16 EDT, trackchg-architect (architect, session 988b396b): watcher stopped (trackchg-architect, 988b396b; relieved by trackchg-architect-ho2, 853fcbfc; the board watcher had been off since 2026-10-28 pending John's stop/keep answer)
