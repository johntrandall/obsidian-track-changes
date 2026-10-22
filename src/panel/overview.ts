// Vault-wide "Pending changes" view: one row per markdown file that still
// holds suggestions, comments or highlights, most to review first. Clicking a
// row opens the file and the review panel for it. Reads from the plugin's
// VaultIndex and repaints (debounced) whenever the index changes.

import { ItemView, WorkspaceLeaf, debounce, setIcon } from "obsidian";

import {
  describeSummary,
  filterRows,
  markCount,
  sortRows,
  totals,
  type FileRow,
} from "../pending";
import type { VaultIndex } from "../vault-index";

export const OVERVIEW_VIEW_TYPE = "tc-pending-overview";

export interface OverviewHost {
  index: VaultIndex;
  /** Open the file in the main area and reveal the review panel for it. */
  openFileForReview(path: string): Promise<void>;
  /** The path of the file the user is currently looking at, for the active marker. */
  activeFilePath(): string | null;
}

export class PendingOverviewView extends ItemView {
  private host: OverviewHost;
  private query = "";
  private unsubscribe: (() => void) | null = null;
  private rerender = debounce(() => this.render(), 150, true);

  constructor(leaf: WorkspaceLeaf, host: OverviewHost) {
    super(leaf);
    this.host = host;
    this.navigation = false;
  }

  getViewType(): string {
    return OVERVIEW_VIEW_TYPE;
  }
  getDisplayText(): string {
    return "Pending changes (whole vault)";
  }
  getIcon(): string {
    return "list-checks";
  }

  async onOpen(): Promise<void> {
    this.contentEl.addClass("tc-panel", "tc-overview");
    this.unsubscribe = this.host.index.onChange(() => this.rerender());
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => this.markActiveRow()),
    );
    this.render();
    if (!this.host.index.ready && !this.host.index.scanning) {
      void this.host.index.scanAll();
    }
  }

  async onClose(): Promise<void> {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.contentEl.empty();
  }

  private render(): void {
    const el = this.contentEl;
    el.empty();

    const index = this.host.index;
    const allRows = sortRows(index.rows());
    const rows = filterRows(allRows, this.query);
    const sum = totals(allRows);

    // Header: title, totals, rescan.
    const header = el.createDiv({ cls: "tc-header tc-overview-header" });
    const titleRow = header.createDiv({ cls: "tc-overview-title-row" });
    titleRow.createDiv({ cls: "tc-header-title", text: "Pending changes" });
    titleRow.createSpan({ cls: "tc-scope tc-scope-vault", text: "Whole vault" });
    const rescan = titleRow.createEl("button", {
      cls: "clickable-icon tc-icon-btn tc-overview-rescan",
      attr: { "aria-label": "Rescan vault" },
    });
    setIcon(rescan, index.scanning ? "loader" : "refresh-cw");
    if (index.scanning) rescan.addClass("tc-overview-spinning");
    rescan.addEventListener("click", () => void index.scanAll());

    const countsText = index.scanning && !index.ready
      ? "Scanning vault…"
      : sum.files === 0
        ? "Nothing to review in this vault."
        : `${sum.files} ${sum.files === 1 ? "file" : "files"} · ${describeSummary(sum)}`;
    header.createDiv({ cls: "tc-header-counts", text: countsText });

    // Filter box.
    const filter = el.createEl("input", {
      cls: "tc-overview-filter",
      attr: { type: "search", placeholder: "Filter by path…", spellcheck: "false" },
    });
    filter.value = this.query;
    filter.addEventListener("input", () => {
      this.query = filter.value;
      this.renderRows(list, allRows);
    });

    const list = el.createDiv({ cls: "tc-card-list tc-overview-list" });
    this.renderRows(list, allRows);
    void rows;
  }

  private renderRows(list: HTMLElement, allRows: FileRow[]): void {
    list.empty();
    const rows = filterRows(allRows, this.query);
    if (allRows.length === 0 && this.host.index.ready) {
      list.createEl("p", { cls: "tc-empty", text: "All caught up — no files have open suggestions, comments, or a whole-review flag." });
      return;
    }
    if (rows.length === 0 && allRows.length > 0) {
      list.createEl("p", { cls: "tc-empty", text: "No files match the filter." });
      return;
    }
    const active = this.host.activeFilePath();
    // Three groups, like the decision board's two review columns (John,
    // 2026-10-22): `review: whole` with no approved_at = "Needs review"
    // (never approved); with approved_at = "Dirty" (approved, changed since);
    // then notes with open marks. A flagged note with marks shows once, in
    // its flag group, chips included. The plugin only reads the frontmatter.
    const needs = rows.filter((r) => r.reviewWhole && !r.approvedAt);
    const dirty = rows.filter((r) => r.reviewWhole && r.approvedAt);
    const marked = rows.filter((r) => !r.reviewWhole);
    const groups: Array<[string, FileRow[], boolean]> = [
      [`Needs review (${needs.length})`, needs, true],
      [`Dirty: approved, changed since (${dirty.length})`, dirty, true],
      [`Open marks (${marked.length})`, marked, false],
    ];
    const several = groups.filter(([, g]) => g.length > 0).length > 1;
    for (const [title, group, whole] of groups) {
      if (group.length === 0) continue;
      if (several) list.createDiv({ cls: "tc-overview-group", text: title });
      for (const r of group) this.renderRow(list, r, active, whole);
    }
  }

  private renderRow(list: HTMLElement, r: FileRow, active: string | null, whole: boolean): void {
    {
      const card = list.createDiv({ cls: "tc-card tc-overview-row" });
      if (whole) card.addClass("tc-overview-row-whole");
      card.setAttr("data-tc-path", r.path);
      if (r.path === active) card.addClass("tc-overview-row-active");
      card.addEventListener("click", () => void this.host.openFileForReview(r.path));

      const slash = r.path.lastIndexOf("/");
      const folder = slash >= 0 ? r.path.slice(0, slash) : "";
      const name = (slash >= 0 ? r.path.slice(slash + 1) : r.path).replace(/\.md$/, "");
      const nameRow = card.createDiv({ cls: "tc-overview-name-row" });
      nameRow.createSpan({ cls: "tc-overview-name", text: name });
      if (folder) nameRow.createSpan({ cls: "tc-overview-folder", text: folder });

      const chips = card.createDiv({ cls: "tc-overview-chips" });
      if (whole) {
        const tag = chips.createSpan({ cls: "tc-overview-chip tc-chip-whole" });
        setIcon(tag.createSpan({ cls: "tc-overview-chip-icon" }), "book-open");
        tag.createSpan({ cls: "tc-overview-chip-count", text: "whole" });
        tag.setAttr("aria-label", "Needs reading as a whole (frontmatter review: whole)");
        if (r.approvedAt) {
          chips.createSpan({ cls: "tc-overview-approved", text: `approved ${r.approvedAt}` });
        }
      }
      if (!whole || markCount(r) > 0) {
        this.chip(chips, "pencil", r.suggestions, "suggestion", "tc-chip-suggestions");
        this.chip(chips, "message-square", r.comments, "comment", "tc-chip-comments");
        if (r.highlights > 0) {
          this.chip(chips, "highlighter", r.highlights, "highlight", "tc-chip-highlights");
        }
      }
    }
  }

  private chip(parent: HTMLElement, icon: string, n: number, noun: string, cls: string): void {
    const chip = parent.createSpan({ cls: `tc-overview-chip ${cls}` });
    if (n === 0) chip.addClass("tc-overview-chip-zero");
    const i = chip.createSpan({ cls: "tc-overview-chip-icon" });
    setIcon(i, icon);
    chip.createSpan({ cls: "tc-overview-chip-count", text: String(n) });
    chip.setAttr("aria-label", `${n} ${n === 1 ? noun : noun + "s"}`);
  }

  private markActiveRow(): void {
    const active = this.host.activeFilePath();
    this.contentEl.querySelectorAll<HTMLElement>(".tc-overview-row").forEach((row) => {
      row.toggleClass("tc-overview-row-active", row.getAttr("data-tc-path") === active);
    });
  }
}
