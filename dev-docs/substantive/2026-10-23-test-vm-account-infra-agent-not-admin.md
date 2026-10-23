---
_human_verdict: new
title: "Test VM account: infra-agent, not admin"
type: decision
kind: decision
weight: quick
system: obsidian-track-changes
question: "Add an infra-agent account to the golden image now, while it is open for the Accessibility grants, make it the VM's login and SSH user, and retire admin once the tart-vm wrapper and the scripts take the user name as a setting?"
options: ["in-place", "rebuild", "later"]
recommendation: in-place
unblocks: "moving the project VM's test vault to /Users/infra-agent/tc-test-vault; every later clone of the golden image"
asked_by: trackchg-architect
asked_at: "2026-10-23T12:44:25-0400"
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
moved_at: "2026-10-23T12:44:54-0400"
moved_by: trackchg-architect
working_by:
waiting_on:
revisit_when:
revisit_of:
revisits:
review_marks:
---
# Test VM account: infra-agent, not admin

> [!todo] Your move · obsidian-track-changes · trackchg-architect
> You are looking at a decision from trackchg-architect. **Your move:** drag it to **yes** to accept the recommendation (in-place), or to **no**, **revise substance**, **revise presentation**, **later**, **talk** or **snoozed**; or answer in chat. **Then:** trackchg-architect acts on your answer.

## The question

Add an infra-agent account to the golden image now, while it is open for the Accessibility grants, make it the VM's login and SSH user, and retire admin once the tart-vm wrapper and the scripts take the user name as a setting?

**Why:** you objected to the test VMs running as a user called `admin` (2026-10-23 12:35, below). Your policy is that agents work as `infra-agent` on every machine; the golden image predates that and every clone inherits `admin` / `admin`.

## Why this is being asked

**Start here.** Every test VM on SusanBones is cloned from one golden image, `macos-15.7-l2-dev`, whose only account is `admin` with the password `admin`. The project VM's test vault lives at `/Users/admin/tc-test-vault`. The image is running right now for the Accessibility grants, which is the cheapest moment to change it. The question is how: change the running image in place, rebuild it from its build script, or leave it for later. The image belongs to admin-technical (ADR-048), so the change is recorded there too.

**Terms.**
- **Golden image `macos-15.7-l2-dev`**: the base Tart VM every project VM is cloned from; [inventory](file:///Users/johnrandall/admin-technical/inventories/vm-images/macos-15.7-l2-dev.md). Its 2026-05-20 changelog line already says the next build should switch the account to `infra-agent`.
- **`infra-agent`**: the account name agents use on shared machines (your global instructions).
- **tart-vm wrapper**: `~/.local/bin/tart-vm`, the command agents use to clone, boot and reach VMs; it hard-codes `SSH_USER="admin"` and `SSH_PASS="admin"` (lines 22–23). The `tart-vm-management` skill and this project's `scripts/vm-test.sh` assume `admin` too.
- **Clean rebuild**: running `~/admin-technical/setup/vm-images/scripts/build-l2.sh` from the layer below (L1) to produce a new image version.
- **Accessibility grants**: stored per program in the machine-wide permission database, not per user (Verified: the rows are in `/Library/Application Support/com.apple.TCC/TCC.db`), so they survive an account change.

## Options and consequences

- **in-place** (recommended): in the running image, add `infra-agent` (admin rights, auto-login, the SSH key, Screen Sharing access), keep `admin` enabled only until the wrapper, the skill and `scripts/vm-test.sh` read the user name from a setting (default `infra-agent`), then disable `admin`'s login. Cost: about an hour of agent work plus one sign-in prompt in System Settings that macOS may show you at the next Screen Sharing visit; 23 existing clones keep `admin` until re-cloned. Undo: re-enable `admin`, set the wrapper's default back.
- **rebuild** (viable): a new image version from `build-l2.sh` with `infra-agent` and the full permission set baked in. Cleanest result; costs a rebuild of several hours, and the Accessibility grants have to be done again in the new image by you.
- **later** (fallback): keep `admin` for now and let the switch ride with the next planned rebuild; nothing changes today.

## Design impact

- [Golden image inventory](file:///Users/johnrandall/admin-technical/inventories/vm-images/macos-15.7-l2-dev.md): today "admin user", switch deferred. After in-place: `infra-agent` listed as the login user, `admin` disabled, a changelog line.
- tart-vm wrapper and the `tart-vm-management` skill: today hard-code `admin`. After: the user is a setting, default `infra-agent`.
- This project's `scripts/vm-test.sh` and README: today `/Users/admin/tc-test-vault`. After: `/Users/infra-agent/tc-test-vault`.

**Binds:** the architect (makes the change in the image, the wrapper, the skill and the scripts, and records it in admin-technical). · **Your part:** the Accessibility grants as already planned (they apply to either account); possibly one macOS password prompt. · **Does not change:** your own Macs; VMs already cloned until they are re-cloned.

## Recommendation

**in-place.** The image is open now, the grants carry over, and a rebuild would ask you for the grants a second time; making the user a setting also stops the name being baked into every script again.

## History

- 2026-10-23 ~12:35 EDT, you in the founding session's tab (verbatim, relayed by obsidian-track-changes-df): "Why do we have a user called admin that we're running test vaults on? That's not right."
- 2026-05-20: the inventory recorded the switch to `infra-agent` as a deferred rebuild item.

## Links

- [Golden image inventory](file:///Users/johnrandall/admin-technical/inventories/vm-images/macos-15.7-l2-dev.md)
- [ADR-048, the VM image layers](file:///Users/johnrandall/admin-technical/ADRs/ADR-048-VM-Image-Layer-Architecture.md)
- [[dev-docs/substantive/2026-10-23-accessibility-grants-in-the-golden-vm|Accessibility grants in the golden VM (same image pass)]]
- [[dev-docs/substantive/2026-10-23-tailscale-in-the-golden-vm-image|Tailscale in the golden VM image (same image pass)]]

## The human's words

## Talk to the agent

- [Focus the agent that asked](http://link.localhost/herdr-jump#988b396b-f824-464e-83db-39e5a05961e0)
- [Focus its workspace](http://link.localhost/herdr-workspace#label=%F0%9F%93%A6%20s-app%20obsidian-track-changes)

## Card log

One line per edit: when, who (name, role, session), what. Written by the `watchbill decide` verbs and `watchbill decisions` sweeps; an agent that edits the card by hand adds its own line the same way.

- 2026-10-23T12:44:25-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · created the card [lane: agent drafting]
- 2026-10-23T12:44:54-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · filled in the card body by hand
- 2026-10-23T12:44:54-0400 · trackchg-architect (architect, session 988b396b-f824-464e-83db-39e5a05961e0) · moved agent drafting → new [lane: new]

## John's comments

Type under the last *John* heading, or answer in chat; drag the card to **revise** when you want the agent to act on what you wrote.

### John
