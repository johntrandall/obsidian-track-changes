---
_human_verdict: agent waiting
title: Tailscale in the golden VM image
type: decision
kind: decision
weight: quick
asks:
system: obsidian-track-changes
question: Install the Tailscale program (no login) in the golden image macos-15.7-l2-dev, so each VM cloned from it joins the tailnet under its own name at first boot with an ephemeral key?
options: ["install", "forward"]
recommendation: install
unblocks: reaching a test VM by its own name from the iPad, instead of a port forwarded through SusanBones
asked_by: trackchg-architect
asked_at: "2026-10-23T12:12:03-0400"
asked_via: chat
status: answered
applied_at:
applied_how:
undo:
source: chat
recorded_where: chat, heard by session 988b396b-f824-464e-83db-39e5a05961e0
relayed_by:
spawned:
subject:
subject_fingerprint:
human_note:
human_words: "Come on, Adam. Yes, I approve the publication. We don't want tail scale in the golden Vienna image. That should be one step down, so... so, whatever, we do, it needs to be part of the BM inheritage chain, the tail scale should be a separate step. Does the ends might be doing dangerous things, and they might, be throwaway? We might want to use BM as an isolated environment, so we don't want it to be network connected by default. Yeah, that's one step beyond the Golden DM. What's our current hierarchy of the Amsterdam? Something like bass to golden to tail scale. What's the inheritage chain there? Can you print me a one cheater that shows the inheritance chain after we finalize it in this chat?"
snooze_until:
previous_verdict: revise proposal
moved_at: "2026-10-24T11:31:12-0400"
moved_by: trackchg-architect
working_by:
waiting_on: "John: the three image-chain questions asked in chat 2026-10-23 13:4x (L2a tailnet layer name, what isolated means, which account in L2)"
revisit_when:
revisit_of:
revisits:
review_marks:
---
# Tailscale in the golden VM image

> [!todo] Your move · obsidian-track-changes · trackchg-architect
> Nothing for you: waiting on John: the three image-chain questions asked in chat 2026-10-23 13:4x (L2a tailnet layer name, what isolated means, which account in L2).

## The question

Install the Tailscale program (no login) in the golden image macos-15.7-l2-dev, so each VM cloned from it joins the tailnet under its own name at first boot with an ephemeral key?

**Why:** a test VM has no network name of its own today, so reaching it from the iPad means a port forwarded through SusanBones that an agent must open and close by hand; you asked on 2026-10-21 why you were going through SusanBones rather than into the VM itself.

## Why this is being asked

**Start here.** Test VMs are cloned from the golden image `macos-15.7-l2-dev` and live on SusanBones' private network, reachable only from SusanBones. To open one in Screen Sharing from the iPad, the founding session forwarded port 5901 on SusanBones to the VM. Putting Tailscale inside the image would let each clone appear on your tailnet under its own name. It is a change to a shared base image that admin-technical owns (ADR-048), so it needs your word.

**Terms.**
- **Golden image**: the base Tart VM every project VM is cloned from; [inventory](file:///Users/johnrandall/admin-technical/inventories/vm-images/macos-15.7-l2-dev.md).
- **Tailnet**: your Tailscale network; a device on it is reachable by name from any of your devices.
- **Ephemeral auth key**: a Tailscale key that enrols a device which disappears from the tailnet when it goes offline, so short-lived VMs leave no clutter; stored in 1Password.
- **No login in the image**: the image carries the program only, never a logged-in identity; otherwise every clone would be the same device.

## Options and consequences

- **install** (recommended): Tailscale binary in the image, no login; each clone enrols itself at first boot with an ephemeral tagged key (the `tart-vm` wrapper's `claude` class already does this with `TS_AUTHKEY`). You reach a VM as `vnc://<vm-name>`. Costs: one ephemeral key in 1Password; a tag and an access rule on the tailnet; the image is changed in its next update. Undo: remove the program from the image; existing clones keep working through SusanBones.
- **forward** (fallback): keep forwarding a port through SusanBones when you need a VM's screen (one command to open, one to close). Costs: an agent must be asked each time, and the forward can be forgotten open.

## Design impact

- [Golden image inventory](file:///Users/johnrandall/admin-technical/inventories/vm-images/macos-15.7-l2-dev.md) and the `dev-base-image-update` procedure: today no Tailscale. After install: Tailscale listed under installed software, the no-login rule stated, the key named.
- The `tart-vm` wrapper: clones of this image enrol at first boot.

**Binds:** the architect (makes the change in the running golden image while it is up for the Accessibility grants, then records it in admin-technical). · **Your part:** none after install, unless the tailnet's access rules need your sign-in to add the tag (the architect says so if they do). · **Does not change:** your own Macs and the iPad; VMs on other hosts.

## Recommendation

**install.** It removes a manual step every time you want to see a test VM, at the cost of one key; the no-login rule keeps clones from colliding. The architect does it in the same pass as the Accessibility grants, before the image is stopped.

## History

- 2026-10-21, you on the iPad, in the founding session's chat (verbatim, relayed by obsidian-track-changes-df): "Why are we going into Susan Bones rather than going into the VM itself?  Shouldn't we be going into the VM itself?"
- The founding session answered that the VM has no network identity and offered the two options above, recommending install; no answer since.

## Links

- [Golden image inventory](file:///Users/johnrandall/admin-technical/inventories/vm-images/macos-15.7-l2-dev.md)
- [ADR-048, the VM image layers](file:///Users/johnrandall/admin-technical/ADRs/ADR-048-VM-Image-Layer-Architecture.md)
- [[dev-docs/substantive/2026-10-23-accessibility-grants-in-the-golden-vm|Accessibility grants in the golden VM (the same image pass)]]

## The human's words

> Come on, Adam. Yes, I approve the publication. We don't want tail scale in the golden Vienna image. That should be one step down, so... so, whatever, we do, it needs to be part of the BM inheritage chain, the tail scale should be a separate step. Does the ends might be doing dangerous things, and they might, be throwaway? We might want to use BM as an isolated environment, so we don't want it to be network connected by default. Yeah, that's one step beyond the Golden DM. What's our current hierarchy of the Amsterdam? Something like bass to golden to tail scale. What's the inheritage chain there? Can you print me a one cheater that shows the inheritance chain after we finalize it in this chat?

(in chat, 2026-10-23T13:40:38-0400, recorded by 988b396b-f824-464e-83db-39e5a05961e0)

## Talk to the agent

- [Focus the agent that asked](http://link.localhost/herdr-jump#988b396b-f824-464e-83db-39e5a05961e0)
- [Focus its workspace](http://link.localhost/herdr-workspace#label=%F0%9F%93%A6%20s-app%20obsidian-track-changes)

## Card log

One line per edit: when, who (name, role, session), what. Written by the `watchbill decide` verbs and `watchbill decisions` sweeps; an agent that edits the card by hand adds its own line the same way.

- 2026-10-23T12:12:03-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · created the card [lane: agent drafting]
- 2026-10-23T12:12:48-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · filled in the card body by hand
- 2026-10-23T12:13:01-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · moved agent drafting → new [lane: new]
- 2026-10-23T13:40:38-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · recorded the human's chat answer: revise substance [lane: revise substance]
- 2026-10-23T13:40:43-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · moved revise substance → agent working (by trackchg-architect) [lane: agent working]
- 2026-10-24T11:31:12-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · moved agent working → agent waiting (waiting on John: the three image-chain questions asked in chat 2026-10-23 13:4x (L2a tailnet layer name, what isolated means, which account in L2)) [lane: agent waiting]

## John's comments

Type under the last *John* heading, or answer in chat; drag the card to **revise** when you want the agent to act on what you wrote.

### John
