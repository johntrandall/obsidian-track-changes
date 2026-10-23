// vm-mobile-smoke.js: the review-panel smoke test that `scripts/vm-test.sh smoke-mobile` runs
// inside the Obsidian window of the project VM, with mobile emulation on (app.emulateMobile(true)).
//
// It is not a module: vm-test.sh reads this file in the vault window and evaluates it with an
// indirect eval, so the file is a single function expression `(async function (app, opts) {...})`.
// It runs the plan in test/fixtures/vm-mobile-smoke.json (the expectations there are checked
// against the pure modules by test/vm-smoke-plan.test.mjs) at each window size in the plan:
// reset fixture.md, open the review panel and the pending overview by command id, read the
// panel DOM, check the editor menu items, run the cursor commands with the cursor placed through
// the editor API, press the panel's Accept all / Remove comments / Approve buttons, and after
// every step read the panel and the note's text and screenshot the window into opts.outDir.
// Results go to <outDir>/results.json (done: true when finished); vm-test.sh polls for it.
(async function smoke(app, opts) {
  const fs = require("fs");
  const path = require("path");
  const electron = require("electron");
  const win = electron.remote.getCurrentWindow();
  const wc = win.webContents;
  const plan = JSON.parse(fs.readFileSync(path.join(opts.root, "test/fixtures/vm-mobile-smoke.json"), "utf8"));
  const fixtureText = fs.readFileSync(path.join(opts.root, "test/fixtures/vm-fixture.md"), "utf8");
  const outDir = opts.outDir;
  fs.mkdirSync(outDir, { recursive: true });

  const results = {
    runId: opts.runId,
    started: new Date().toISOString(),
    done: false,
    environment: {
      obsidian: (() => { try { return electron.ipcRenderer.sendSync("version"); } catch (e) { return null; } })(),
      isMobile: app.isMobile,
      userAgent: navigator.userAgent,
      plugin: app.plugins.manifests["track-changes"]?.version ?? null,
    },
    checks: [],
    errors: [],
    shots: [],
  };
  const write = () => fs.writeFileSync(path.join(outDir, "results.json"), JSON.stringify(results, null, 2));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let size = "setup";
  let shotN = 0;

  function check(step, name, ok, expected, actual, knownIssue) {
    let status = ok ? "pass" : "FAIL";
    if (knownIssue) status = ok ? "KNOWN-FIXED" : "KNOWN";
    results.checks.push({ size, step, name, status, expected, actual, ...(knownIssue && { knownIssue }) });
    write();
  }
  async function shot(label) {
    await sleep(250);
    const img = await win.capturePage();
    const name = `${String(++shotN).padStart(2, "0")}-${size}-${label}.png`;
    fs.writeFileSync(path.join(outDir, name), img.toPNG());
    results.shots.push(name);
    return name;
  }

  // Errors: anything logged as an error or thrown while the smoke runs (plugin reload included).
  const origError = console.error;
  console.error = (...a) => {
    results.errors.push(a.map((x) => (x && x.stack) || String(x)).join(" "));
    origError.apply(console, a);
  };
  const onError = (e) => results.errors.push("error: " + (e.message || String(e)));
  const onRejection = (e) => results.errors.push("unhandledrejection: " + ((e.reason && e.reason.stack) || String(e.reason)));
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);

  const toRegex = (s) => new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/<DATE>/g, "\\d{4}-\\d{2}-\\d{2}"));
  const file = () => app.vault.getAbstractFileByPath("fixture.md");

  async function fixtureLeaf() {
    let leaf = app.workspace.getLeavesOfType("markdown").find((l) => l.view.file && l.view.file.path === "fixture.md");
    if (!leaf) {
      leaf = app.workspace.getLeaf(false);
      await leaf.openFile(file());
    }
    app.workspace.setActiveLeaf(leaf, { focus: true });
    await sleep(300);
    return leaf;
  }
  function panelEl() {
    const l = app.workspace.getLeavesOfType("tc-review-panel")[0];
    return l ? l.view.containerEl : null;
  }
  function readPanel() {
    const el = panelEl();
    if (!el) return null;
    const q = (s) => el.querySelector(s);
    const texts = (s) => [...el.querySelectorAll(s)].map((b) => b.textContent.trim());
    return {
      counts: q(".tc-header-counts") ? q(".tc-header-counts").textContent : null,
      resolvedTitle: q(".tc-resolved-title") ? q(".tc-resolved-title").textContent : null,
      resolvedFolded: !!q(".tc-resolved-section-folded"),
      decide: el.querySelectorAll(".tc-card-decide").length,
      buttons: texts(".tc-header-actions button:not(.tc-btn-approve)"),
      approve: q(".tc-btn-approve") ? q(".tc-btn-approve").textContent : null,
      ackBadges: texts(".tc-status-acknowledged"),
      resolvedBadges: texts(".tc-status-resolved"),
    };
  }
  // Open (or reveal) the review panel for fixture.md the way a user would: from the note.
  async function showPanel() {
    await fixtureLeaf();
    app.commands.executeCommandById("track-changes:open-review-panel");
    await sleep(700);
  }
  async function waitPanel(expectedCounts) {
    for (let i = 0; i < 20; i++) {
      const p = readPanel();
      if (p && (expectedCounts === undefined || p.counts === expectedCounts)) return p;
      await sleep(200);
    }
    return readPanel();
  }
  // Every header button, and the panel itself, inside the window: usable at this size.
  function usable() {
    const el = panelEl();
    if (!el) return { ok: false, why: "no panel" };
    const r = el.getBoundingClientRect();
    const out = { panel: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], viewport: [innerWidth, innerHeight], offscreen: [] };
    for (const b of el.querySelectorAll(".tc-header-actions button, .tc-card-decide .clickable-icon")) {
      const br = b.getBoundingClientRect();
      if (br.width === 0 || br.height === 0 || br.right > innerWidth + 1 || br.left < -1 || br.top < -1) {
        out.offscreen.push((b.getAttribute("aria-label") || b.textContent.trim()) + ` @${Math.round(br.left)},${Math.round(br.top)} ${Math.round(br.width)}x${Math.round(br.height)}`);
      }
    }
    out.ok = r.width >= 200 && out.offscreen.length === 0;
    return out;
  }
  // The "editor-menu" handlers, run against a recording menu: the titles the plugin adds.
  function menuTitles(leaf) {
    const titles = [];
    const mk = () => {
      const m = {
        addSeparator: () => m,
        addItem(cb) {
          const item = {};
          for (const k of ["setIcon", "onClick", "setSection", "setChecked", "setDisabled", "setWarning"]) item[k] = () => item;
          item.setTitle = (t) => (titles.push(String(t)), item);
          item.setSubmenu = () => sub;
          cb(item);
          return m;
        },
      };
      return m;
    };
    const sub = mk();
    app.workspace.trigger("editor-menu", mk(), leaf.view.editor, leaf.view);
    return titles;
  }
  async function setSize(w, h) {
    try { wc.disableDeviceEmulation(); } catch (e) { /* not emulating */ }
    win.setContentSize(w, h);
    await sleep(900);
    const info = { requested: [w, h], window: [innerWidth, innerHeight], deviceEmulation: false };
    if (innerWidth < w || innerHeight < h) {
      // The VM screen is smaller than the size asked for (macOS clamps windows to the screen):
      // emulate the viewport instead, scaled to fit the window.
      const [cw, ch] = win.getContentSize();
      const scale = Math.min(cw / w, ch / h, 1);
      wc.enableDeviceEmulation({
        screenPosition: "mobile", screenSize: { width: w, height: h }, viewPosition: { x: 0, y: 0 },
        deviceScaleFactor: 0, viewSize: { width: w, height: h }, scale,
      });
      await sleep(900);
      info.deviceEmulation = true;
      info.scale = scale;
    }
    info.viewport = [innerWidth, innerHeight];
    return info;
  }

  const originalSize = win.getContentSize();
  try {
    // ---- once: emulation on, plugin (re)loads cleanly, status bar ----
    check("setup", "mobile emulation is on (app.isMobile)", app.isMobile === true, true, app.isMobile);
    const before = results.errors.length;
    await app.plugins.disablePlugin("track-changes");
    await app.plugins.enablePlugin("track-changes");
    await sleep(1500);
    const plugin = app.plugins.plugins["track-changes"];
    check("setup", "plugin loads under mobile emulation", !!plugin, true, !!plugin);
    check("setup", "no errors while the plugin loads", results.errors.length === before, [], results.errors.slice(before));
    if (!file()) {
      await app.vault.create("fixture.md", fixtureText);
    }
    const sb = plugin && plugin.statusBarEl;
    const sbVisible = !!(sb && sb.isConnected && sb.offsetParent !== null && getComputedStyle(sb).display !== "none");
    const bar = document.querySelector(".status-bar");
    const barVisible = !!(bar && bar.offsetParent !== null && getComputedStyle(bar).display !== "none");
    check("setup", "status bar count not shown on mobile", !sbVisible, false, { statusItemVisible: sbVisible, statusBarVisible: barVisible, statusItemText: sb ? sb.textContent : null });

    for (const s of plan.sizes) {
      size = s.name;
      const sizeInfo = await setSize(s.width, s.height);
      check("size", `viewport is ${s.width}x${s.height}`, sizeInfo.viewport[0] === s.width && sizeInfo.viewport[1] === s.height, [s.width, s.height], sizeInfo);

      // ---- reset the note, open the panel, initial state ----
      await app.vault.modify(file(), fixtureText);
      await sleep(400);
      await showPanel();
      const ini = plan.initial;
      let p = await waitPanel(ini.counts);
      await shot("panel-initial");
      check("initial", "header counts", p && p.counts === ini.counts, ini.counts, p && p.counts);
      check("initial", "Resolved fold title", p && p.resolvedTitle === ini.resolvedTitle, ini.resolvedTitle, p && p.resolvedTitle);
      check("initial", "Resolved fold starts folded", p && p.resolvedFolded === ini.resolvedFolded, ini.resolvedFolded, p && p.resolvedFolded);
      check("initial", "Accept/Reject blocks (one per suggestion)", p && p.decide === ini.decide, ini.decide, p && p.decide);
      check("initial", "header buttons", p && JSON.stringify(p.buttons) === JSON.stringify(ini.buttons), ini.buttons, p && p.buttons);
      check("initial", "acknowledged badge", p && ini.badges.acknowledged.every((t) => p.ackBadges.includes(t)), ini.badges.acknowledged, p && p.ackBadges);
      check("initial", "resolved badge", p && ini.badges.resolved.every((t) => p.resolvedBadges.includes(t)), ini.badges.resolved, p && p.resolvedBadges);
      const u = usable();
      check("initial", "panel and its buttons fit the window", u.ok, "panel >= 200px wide, no button outside the window", u);

      // Open the Resolved fold and look at it.
      const rh = panelEl() && panelEl().querySelector(".tc-resolved-header");
      if (rh) {
        rh.click();
        await sleep(300);
        await shot("panel-resolved-open");
        check("initial", "Resolved fold opens", !panelEl().querySelector(".tc-resolved-section-folded"), "unfolded", panelEl().querySelector(".tc-resolved-section-folded") ? "still folded" : "unfolded");
        rh.click();
      }

      // ---- the pending overview ----
      app.commands.executeCommandById("track-changes:open-pending-overview");
      await sleep(900);
      const ov = app.workspace.getLeavesOfType("tc-pending-overview")[0];
      const names = ov ? [...ov.view.containerEl.querySelectorAll(".tc-overview-name")].map((e) => e.textContent) : [];
      await shot("overview");
      check("overview", "overview opens and lists fixture.md", names.some((n) => n.includes("fixture")), "fixture", names);

      // ---- editor menu items (the mobile selection / long-press menu uses the same event) ----
      for (const m of plan.menus) {
        await app.vault.modify(file(), fixtureText);
        await sleep(200);
        const leaf = await fixtureLeaf();
        const ed = leaf.view.editor;
        const text = ed.getValue();
        if (m.cursorIn) {
          ed.setCursor(ed.offsetToPos(text.indexOf(m.cursorIn) + (m.cursorAt ?? 2)));
        } else {
          const from = text.indexOf(m.selectFrom);
          const to = m.selectTo ? text.indexOf(m.selectTo) + m.selectTo.length : from + m.selectLength;
          ed.setSelection(ed.offsetToPos(from), ed.offsetToPos(to));
        }
        const titles = menuTitles(leaf);
        check("menu", m.name, m.includes.every((t) => titles.includes(t)), m.includes, titles);
      }

      // ---- the steps ----
      await app.vault.modify(file(), fixtureText);
      await sleep(400);
      for (const st of plan.steps) {
        const e = st.expect;
        if (st.command) {
          const leaf = await fixtureLeaf();
          const ed = leaf.view.editor;
          const at = ed.getValue().indexOf(st.cursorIn);
          if (at < 0) {
            check(st.name, "cursor target present", false, st.cursorIn, null);
            continue;
          }
          ed.setCursor(ed.offsetToPos(at + (st.cursorAt ?? 2)));
          const ran = app.commands.executeCommandById(st.command);
          check(st.name, `command ${st.command} runs`, ran !== false, true, ran);
          await sleep(500);
          await showPanel();
        } else if (st.button) {
          await showPanel();
          const btn = [...panelEl().querySelectorAll(".tc-header-actions button")].find((b) => b.textContent.trim() === st.button);
          check(st.name, `panel button "${st.button}" reachable`, !!btn, st.button, readPanel().buttons);
          if (!btn) continue;
          btn.click();
          await sleep(500);
          await shot(`${st.name}-confirm`);
          const ok = document.querySelector(".modal-container .tc-confirm-buttons button.mod-warning");
          check(st.name, "confirmation asks first", !!ok && ok.textContent.trim() === st.confirm, st.confirm, ok && ok.textContent);
          if (ok) ok.click();
          await sleep(700);
        } else if (st.approve) {
          await app.vault.process(file(), (t) => "---\nreview: whole\n---\n" + t);
          await sleep(500);
          await showPanel();
          const p0 = await waitPanel();
          await shot(`${st.name}-before`);
          check(st.name, "Approve button shown for review: whole", p0 && p0.approve === e.approveButton, e.approveButton, p0 && p0.approve);
          const btn = panelEl() && panelEl().querySelector(".tc-btn-approve");
          if (btn) {
            btn.click();
            await sleep(1500);
          }
          const text = await app.vault.read(file());
          for (const c of e.contains || []) check(st.name, `note contains ${c}`, toRegex(c).test(text), c, toRegex(c).test(text) ? "found" : "not found");
          for (const a of e.absent || []) check(st.name, `note lacks ${a}`, !toRegex(a).test(text), a, toRegex(a).test(text) ? "present" : "absent");
          (results.notes = results.notes || []).push({ size, step: st.name, saved: text });
          await shot(st.name);
          continue;
        }
        const p2 = await waitPanel(e.counts);
        const text = file() ? await app.vault.read(file()) : "";
        const live = (await fixtureLeaf()).view.editor.getValue();
        await showPanel();
        await shot(st.name);
        check(st.name, "header counts", p2 && p2.counts === e.counts, e.counts, p2 && p2.counts, st.knownIssue);
        check(st.name, "Resolved fold title", p2 && p2.resolvedTitle === e.resolvedTitle, e.resolvedTitle, p2 && p2.resolvedTitle);
        check(st.name, "Accept/Reject blocks", p2 && p2.decide === e.decide, e.decide, p2 && p2.decide);
        if (e.buttons) check(st.name, "header buttons", p2 && JSON.stringify(p2.buttons) === JSON.stringify(e.buttons), e.buttons, p2 && p2.buttons);
        for (const c of e.contains || []) check(st.name, `note contains ${c}`, toRegex(c).test(live), c, toRegex(c).test(live) ? "found" : "not found");
        for (const a of e.absent || []) check(st.name, `note lacks ${a}`, !toRegex(a).test(live), a, toRegex(a).test(live) ? "present" : "absent");
        (results.notes = results.notes || []).push({ size, step: st.name, editor: live, savedMatchesEditor: text === live });
      }
      const u2 = usable();
      check("end", "panel still fits the window", u2.ok, "fits", u2);
    }
  } catch (err) {
    results.errors.push("smoke aborted: " + ((err && err.stack) || String(err)));
    check("abort", "smoke ran to the end", false, "no exception", String(err));
  } finally {
    try { wc.disableDeviceEmulation(); } catch (e) { /* ignore */ }
    win.setContentSize(originalSize[0], originalSize[1]);
    console.error = origError;
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
    results.finished = new Date().toISOString();
    results.summary = {
      pass: results.checks.filter((c) => c.status === "pass").length,
      fail: results.checks.filter((c) => c.status === "FAIL").length,
      known: results.checks.filter((c) => c.status === "KNOWN").length,
      knownFixed: results.checks.filter((c) => c.status === "KNOWN-FIXED").length,
      errors: results.errors.length,
    };
    results.done = true;
    write();
  }
  return JSON.stringify(results.summary);
});
