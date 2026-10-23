---
_human_verdict: new
title: Accessibility grants in the golden VM
type: decision
kind: decision
weight: quick
system: obsidian-track-changes
question: Switch on Accessibility for the four TCC principal apps in the golden VM image macos-15.7-l2-dev, through Screen Sharing (about five minutes)?
options: []
recommendation: "yes"
unblocks: "build-queue item 2: stopping the golden image, re-cloning the project VM, closing the 5901 forward; possibly the first vault in the project VM (mobile harness gate, criterion 3)"
asked_by: trackchg-architect
asked_at: "2026-10-23T12:11:13-0400"
asked_via: chat
status: open
applied_at:
applied_how:
undo:
source:
recorded_where:
relayed_by:
spawned:
subject:
subject_fingerprint:
human_note:
human_words:
snooze_until:
previous_verdict:
moved_at: "2026-10-23T12:11:52-0400"
moved_by: trackchg-architect
working_by:
waiting_on:
revisit_when:
revisit_of:
revisits:
review_marks:
---
# Accessibility grants in the golden VM

> [!success] What changed · revision 2 · 2026-10-23 12:33 · trackchg-architect
> - Changed: step 1 names the full tailnet host for Screens on the iPad.

> [!todo] Your move · obsidian-track-changes · trackchg-architect
> You are looking at a decision from trackchg-architect. **Your move:** drag it to **yes** to accept the recommendation (yes), or to **no**, **revise substance**, **revise presentation**, **later**, **talk** or **snoozed**; or answer in chat. **Then:** trackchg-architect acts on your answer.

## The question

Switch on Accessibility for the four TCC principal apps in the golden VM image macos-15.7-l2-dev, through Screen Sharing (about five minutes)?

**Why:** agents drive GUI apps inside test VMs (clicks, menus, reading windows) only with macOS Accessibility permission, and macOS lets only a person at the screen switch that on. The golden image ships without it, so every VM cloned from it starts unable to click, and the project VM's first Obsidian vault may need a click nobody can make.

## Why this is being asked

**Start here.** This is a piece of work only you can do: tick four switches in System Settings inside a virtual Mac. It waits on you because macOS refuses those switches to scripts. Once done, the architect bakes them into the image, so every future clone has them and you never do this again for this image.

**Terms.**
- **Golden image `macos-15.7-l2-dev`**: the base macOS virtual machine (Tart VM) that project VMs are cloned from; inventory [file](file:///Users/johnrandall/admin-technical/inventories/vm-images/macos-15.7-l2-dev.md). Running now on SusanBones at 192.168.64.8.
- **TCC principal app**: a small app named for one purpose (for example *Click Automation (cliclick)*) that wraps one tool, so that a permission is granted to that purpose and not to every program that shares the interpreter (the `tcc-principal-wrapping` convention). Four are installed in `/Applications/TCC Principals/` in the VM.
- **Screen Sharing forward**: `susanbones:5901` is forwarded to the VM's screen (tailscale serve), so you can reach it from any Mac or the iPad.
- **Project VM `obsidian-track-changes-dev`**: this project's throwaway test Mac, cloned from the golden image; re-cloned after your grants.

**State, Verified 2026-10-23 12:15 EDT** (the VM's permission database): the four apps are installed; *Click Automation (cliclick)* is listed and off; the other three are not listed yet.

## Your steps

1. ==Open Screen Sharing to `vnc://susanbones.flicker-duckbill.ts.net:5901` (on the iPad: the Screens app, host `susanbones.flicker-duckbill.ts.net`, port 5901, the route you used on 2026-10-21).== VNC password `admin`; if macOS asks to log in: user `admin`, password `admin`.
2. In the VM: System Settings → Privacy & Security → Accessibility.
3. Switch on **Click Automation (cliclick)** (already in the list).
4. Click **+**, go to `/Applications/TCC Principals/`, add and switch on **GUI Scripting (osascript)**, **Ax Inspector (axmcp)** and **Appkit Scripting (python)**. Authenticate with `admin` / `admin` when asked.
5. Close Screen Sharing and answer yes on this card (or say "done" in chat). Screen Recording is not needed: a Tart VM grants screen capture implicitly.

## Design impact

- [Golden image inventory](file:///Users/johnrandall/admin-technical/inventories/vm-images/macos-15.7-l2-dev.md): today its "TCC grants baked in" table marks the grants "intended (next build)". After: the four principals listed as granted, with the date and a changelog line.
- Project VM `obsidian-track-changes-dev`: today cloned before the principals existed. After: destroyed and re-cloned from the granted image, so `scripts/vm-test.sh` can click in Obsidian.
- The 5901 forward: closed (`tailscale serve --tcp=5901 off`) once the image is stopped.

**Binds:** the architect (verifies, stops the image, updates the inventory, re-clones). · **Your part:** the five steps above, blocking. · **Does not change:** any of your own Macs; nothing outside the VM image is granted.

## Options and consequences

- **yes** (recommended): you tick four switches; the architect checks the database (expects every `com.johnrandall.*` row granted), runs each principal once, stops the image (the grants persist in the stopped image), updates the inventory and re-clones the project VM. Undo: switch them off in the same pane.
- **no** (viable): the image stays as it is; GUI automation in its clones keeps failing, and the project VM's first vault may need you to click it open by hand each time it is re-cloned.

## Recommendation

**yes.** Five minutes once, and every VM cloned from this image can be driven by agents without asking you again. On your yes the architect does the verification and the rest of build-queue item 2.

## History

- 2026-10-20: the founding session (8a6e4f5e) found the golden image lacked the Accessibility grants its skill promised, built the four principal apps and installed them in the image on SusanBones; it asked you to grant them, and the question stayed open through its handoff on 2026-10-23.

## Links

- [Golden image inventory](file:///Users/johnrandall/admin-technical/inventories/vm-images/macos-15.7-l2-dev.md)
- [[dev-docs/build-queue|Build queue (item 2)]]
- [[dev-docs/runs/2026-10-23-adopt-watchbill/origin-scratchpad/tcc-payload/make-tcc-wrapper.sh|How the principal apps are made]]
- [[dev-docs/runs/2026-10-23-mobile-harness/briefs/cycle|Mobile harness cycle brief (criterion 3 may wait on this)]]

## The human's words

## Talk to the agent

- [Focus the agent that asked](http://link.localhost/herdr-jump#988b396b-f824-464e-83db-39e5a05961e0)
- [Focus its workspace](http://link.localhost/herdr-workspace#label=%F0%9F%93%A6%20s-app%20obsidian-track-changes)

## Card log

One line per edit: when, who (name, role, session), what. Written by the `watchbill decide` verbs and `watchbill decisions` sweeps; an agent that edits the card by hand adds its own line the same way.

- 2026-10-23T12:11:13-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · created the card [lane: agent drafting]
- 2026-10-23T12:11:41-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · filled in the card body by hand
- 2026-10-23T12:11:52-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · moved agent drafting → new [lane: new]
- 2026-10-23T12:18:33-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · replied: Noted. The card stays in front of you until the grants are in. A background check reads the VM's permission database ev…
- 2026-10-23T12:32:28-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · replied: One more thing now waits on these grants: the iPad mobile-emulation smoke run. The builder found that Obsidian in the p…
- 2026-10-23T12:33:22-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · revision 2: step 1 host corrected to the tailnet name

## John's comments

Type under the last *John* heading, or answer in chat; drag the card to **revise** when you want the agent to act on what you wrote.

### trackchg-architect · 2026-10-23 12:18

> when I get back, I'll do the TTC Grant

Noted. The card stays in front of you until the grants are in. A background check reads the VM's permission database every minute, and the moment all four apps show as granted I verify each one live and finish build-queue item 2 (stop and bake the image, update the inventory, re-clone the project VM, close the 5901 forward). Nothing else is needed from you; answering the card is optional.

### trackchg-architect · 2026-10-23 12:32

One more thing now waits on these grants: the iPad mobile-emulation smoke run. The builder found that Obsidian in the project VM shows no window until a vault is opened by hand once, and its command line must be switched on in Settings (evidence: [[dev-docs/runs/2026-10-23-mobile/vault-registration-attempts.txt|vault registration attempts]], merged at landing). With your four grants baked into the image, an agent can make those two clicks itself through the GUI in the re-cloned VM, so this adds no step for you.

### John
