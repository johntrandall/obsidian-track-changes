# Track Changes on the iPad: a ten-minute check by hand

This is the check a person runs on a real iPad to confirm the Track Changes plugin (John's fork) works there: making tracked changes, reviewing them in the panel, and approving a note. It is written for someone who has not used the plugin before. Nothing here can be automated: Obsidian for iOS is an App Store build that does not run in the iOS Simulator, so the automated checks stop at Obsidian desktop's mobile emulation (`scripts/vm-test.sh smoke-mobile`) and a WebKit run of the unit tests (`npm run test:webkit`). This list covers what only the device can show: touch, the on-screen keyboard, the iOS selection menu, and the sidebars as drawers.

Work in a throwaway note in any vault where the plugin is installed. Every step says what you should see; when what you see differs, take the screenshots listed at the end and keep going.

## 0. Before you start (1 minute)

1. Open **Settings → Community plugins** and check that **Track Changes** is on. Note its version (for example `2.3.0-jtr.8`); it goes in the report.
2. Open **Settings → Track Changes** and set **Your name** (for example `John`). Marks you make are signed with it.
3. Create a note called `TC iPad test` and paste in the text below (it is the same fixture the automated smoke test uses: one of everything the panel shows). Copy it from this file on a Mac or in a browser; it must arrive unchanged, braces and quotes included.

```text
# VM fixture

An addition: the {author="Claude (editor)" date="2026-10-20"++very ++}quick brown fox.

A deletion: the quick {author="Claude (editor)" date="2026-10-20"--brown --}fox.

A substitution with its rationale: the {author="Claude (editor)" date="2026-10-20"~~quick~>fast~~}{author="Claude (editor)" date="2026-10-20">>Plainer word.<<} fox.

A bare substitution (no thread, so the card offers Comment): {author="Claude (editor)" date="2026-10-20"~~jumps~>leaps~~} over the dog.

An open thread. {author="Claude (editor)" date="2026-10-20">>Could this paragraph be shorter?<<} More prose.

An acknowledged thread. {author="Test Reviewer" date="2026-10-19" acknowledged="2026-10-20" acknowledged-by="Claude (editor)">>Please tighten the intro.<<}{author="Claude (editor)" date="2026-10-20">>Done in the card above.<<}

A resolved thread. {author="Claude (editor)" date="2026-10-19" resolved="2026-10-20">>Consider a table here.<<} It sits in the Resolved section.

A {==highlighted span==}{author="Test Reviewer" date="2026-10-20">>comment on a highlight<<} and a lone {==highlight==}.

AI-inserted text: {=+this sentence was added by the model.+=}
```

In the note you should see coloured marks inline: green insertions, red struck-through deletions, substitutions, a yellow highlight and a rainbow-tinted AI sentence.

**Where commands live on the iPad.** Every action below is a command. Run a command from the **command palette**: pull down on the note (the default gesture), tap the toolbar's command-palette button, or press Cmd-P on a hardware keyboard, then type part of the name. Commands from this plugin are listed as `Track Changes: …`. To get one-tap buttons, add the five authoring commands to the editing toolbar under **Settings → Toolbar** (on some versions **Settings → Mobile**) **→ Manage toolbar options**.

## 1. The review panel and the overview (2 minutes)

1. Run **Track Changes: Open review panel**. The right sidebar slides in (swipe in from the right edge to reopen it later).
   - The header reads `TC iPad test` and `3 comments · 4 suggestions · 1 highlight · 1 resolved`, with the buttons **Accept all**, **Reject all** and **Remove comments**.
   - Cards follow in note order. The acknowledged thread shows a badge `Acknowledged by Claude (editor) 2026-10-20`.
   - At the bottom, a folded **Resolved (1)**. Tap it: it opens and shows "Consider a table here." with a `Resolved 2026-10-20` badge. Tap again to fold.
   - The Accept (✓) and Reject (✗) buttons on each suggestion card sit at the card's right edge and are fully visible. Turn the iPad to portrait and back: nothing is cut off.
2. Run **Track Changes: Open pending changes overview**. The left sidebar shows **Pending changes** with `TC iPad test` in the list. Tap the row: the note opens and the review panel shows it.
3. The iPad has no status bar, so the desktop's "N to review" count is simply absent. That is expected; nothing should report an error.

## 2. Make one of each tracked change (3 minutes)

Do these on the line `More prose.` (or any plain text). To select text, double-tap a word or long-press and drag the handles. Then run the command.

| Do this | Command | You should see |
|---|---|---|
| Select a word | **Mark selection for substitution** | the word becomes `{author="…" date="…"~~word~>~~}` and the cursor waits after `~>`; type the replacement, e.g. `text` |
| Select a word | **Mark selection as deletion** | the word becomes a red struck-through deletion |
| Put the cursor between two words, no selection | **Insert addition** | an empty `{…++++}` with the cursor inside; type `new ` |
| Select a few words | **Insert comment** | the words become a highlight followed by an empty comment with the cursor inside; type `Is this right?` |
| Select a word | **Highlight selection** | the word is highlighted |

Each new mark carries `author="<your name>"` and today's date (switch to Source mode with **Toggle Live Preview/Source mode** to see the raw text). The panel's counts go up as you add them.

Also try the iOS selection menu: select a word and look for **Track changes** items in the menu that appears (or under its `›` arrow). The automated check only proves Obsidian hands the plugin the editor-menu event; whether iOS shows those items is only visible here. Write down what the menu offers.

## 3. Decide them in the panel (3 minutes)

Open the review panel again and work top to bottom:

1. **Accept** (✓) the addition card "very": the note reads `the very quick brown fox.` and the card disappears.
2. **Reject** (✗) the deletion card "brown": the note reads `the quick brown fox.`, unchanged text, mark gone.
3. **Accept** the substitution "quick → fast" that has the rationale "Plainer word.": the note reads `the fast` and the rationale stays in the note, marked resolved; it moves to the **Resolved** fold (now `Resolved (2)`).
4. On the thread "Could this paragraph be shorter?", tap **Mark resolved** (circle-check): it moves to the Resolved fold. Open the fold and tap **Reopen thread** on it: it comes back.
5. Tap **Accept all**: a confirmation asks first; tap **Accept all** in it. Every remaining suggestion, including the ones you made in step 2, is applied; the Accept all / Reject all buttons disappear.
6. Tap **Remove comments**: a confirmation asks first; confirm. Every comment thread goes, resolved ones included, and the highlights they pointed at are unhighlighted. A lone highlight stays.
7. **Approve.** Add a property to the note: `review` with the value `whole` (the Properties panel, or type `---` / `review: whole` / `---` at the very top). The panel header shows a **Needs whole review** badge and an **Approve this version** button. Tap it. A notice says `Approved TC iPad test (…)`, and the note's properties gain `status`, `approved_by`, `approved_at`, `approved_hash` and friends, while `review` disappears.

If you want the cursor commands too: put the cursor inside a mark and run **Accept change at cursor**, **Reject change at cursor**, **Mark comment thread or highlight at cursor resolved** or **Reopen comment thread or highlight at cursor**. They do what the matching card button does.

## 4. If something fails: what to capture

For each failure, take these screenshots (side button + volume up) and note the step number:

1. The whole screen with the review panel open, showing the header counts and the card in question.
2. The note in **Source mode** (command **Toggle Live Preview/Source mode**), scrolled to the mark involved, so the raw `{…}` text is readable.
3. Any notice that popped up (they vanish after a few seconds; screenshot quickly or repeat the step).
4. **Settings → Community plugins** showing the Track Changes version, and **Settings → About** showing the Obsidian and iPadOS versions.

Send the screenshots and step numbers to whoever is working on the Track Changes project (or file them on the project's queue item "Status-bar count and overview on mobile"). When everything passed, a one-line "iPad checklist passed, plugin <version>, Obsidian <version>, iPadOS <version>" is the whole report.

Afterwards delete the `TC iPad test` note.
