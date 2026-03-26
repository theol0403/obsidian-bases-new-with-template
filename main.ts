import { Plugin, TFile, TAbstractFile } from "obsidian";
import { processTemplate } from "./templater";
import {
  BasesTemplateSettings,
  DEFAULT_SETTINGS,
  BasesTemplateSettingTab,
} from "./settings";

export default class BasesTemplatePlugin extends Plugin {
  settings: BasesTemplateSettings;
  // Tracks files awaiting frontmatter with a template property.
  // Value is the cleanup timeout handle.
  private pendingFiles = new Map<string, ReturnType<typeof setTimeout>>();

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new BasesTemplateSettingTab(this.app, this));

    this.app.workspace.onLayoutReady(() => {
      // Primary trigger: file created by Bases "New +"
      this.registerEvent(
        this.app.vault.on("create", async (file: TAbstractFile) => {
          if (!(file instanceof TFile)) return;
          if (!file.basename.startsWith("Untitled")) return;

          this.trackPendingFile(file);

          // Short delay handles the common case (direct base view)
          await new Promise((resolve) => setTimeout(resolve, 150));
          await this.tryProcessFile(file);
        })
      );

      // Fallback trigger: catches frontmatter written after creation (embedded base views).
      // When a base is embedded via ![[note.base]], Obsidian may write the
      // frontmatter after the create event fires. This listener reacts to
      // metadata cache updates so we process the template as soon as the
      // template property appears.
      this.registerEvent(
        this.app.metadataCache.on("changed", async (file: TFile) => {
          if (!this.pendingFiles.has(file.path)) return;
          await this.tryProcessFile(file);
        })
      );
    });
  }

  private trackPendingFile(file: TFile) {
    // Clean up any existing timeout for this path
    const existing = this.pendingFiles.get(file.path);
    if (existing !== undefined) clearTimeout(existing);

    // Auto-expire after 10s to avoid leaking entries
    const timeout = setTimeout(() => {
      this.pendingFiles.delete(file.path);
    }, 10000);
    this.pendingFiles.set(file.path, timeout);
  }

  private async tryProcessFile(file: TFile) {
    if (!this.pendingFiles.has(file.path)) return;

    const fm = this.app.metadataCache.getFileCache(file)?.frontmatter;
    if (!fm) return;

    const value = fm[this.settings.templateProperty];
    if (!value) return;

    // Found the template property — claim this file so no other handler processes it
    const timeout = this.pendingFiles.get(file.path);
    if (timeout === undefined) return;
    clearTimeout(timeout);
    this.pendingFiles.delete(file.path);

    await this.applyTemplate(file, value);
  }

  private async applyTemplate(file: TFile, rawValue: unknown) {
    const values = Array.isArray(rawValue) ? rawValue : [rawValue];
    const activeLeaf = this.app.workspace.getMostRecentLeaf();

    for (const item of values) {
      if (typeof item !== "string") continue;

      const link = item.match(/\[\[(.*?)\]\]/)?.[1];
      if (!link) continue;

      const templateFile = this.app.metadataCache.getFirstLinkpathDest(
        link,
        file.path
      );
      if (!templateFile) continue;

      const path = templateFile.path.toLowerCase();
      const templatesEnabled = !!(this.app as any).internalPlugins.plugins
        .templates?.enabled;
      const templaterEnabled = !!(this.app as any).plugins.plugins[
        "templater-obsidian"
      ];
      const templateFolder = (
        this.app as any
      ).internalPlugins.plugins.templates?.instance.options.folder?.toLowerCase();
      const templaterFolder = (this.app as any).plugins.plugins[
        "templater-obsidian"
      ]?.settings?.templates_folder?.toLowerCase();

      // Determine which plugin to use
      // If both plugins are enabled and use the same folder, prioritize Core Templates
      const useCoreTemplates =
        templatesEnabled &&
        templateFolder &&
        path.startsWith(templateFolder);
      const useTemplater =
        !useCoreTemplates &&
        templaterEnabled &&
        templaterFolder &&
        path.startsWith(templaterFolder);

      if (useCoreTemplates) {
        // Open the file temporarily in full screen to ensure it's the active file to apply the template
        // This is necessary until https://forum.obsidian.md/t/bases-applying-template-in-new-entry-popup-doesnt-apply-properties/105802 is solved
        if (activeLeaf === this.app.workspace.getMostRecentLeaf()) {
          await this.app.workspace.openLinkText(file.path, "", false);
        }
        await (
          this.app as any
        ).internalPlugins.plugins.templates.instance.insertTemplate(
          templateFile
        );
        await new Promise((resolve) => setTimeout(resolve, 100));
      } else if (useTemplater) {
        const processed = await processTemplate(this.app, templateFile);
        if (processed) {
          await this.app.vault.modify(file, processed);
        }
      }
    }

    // if a new leaf was created, return to the original leaf and detach the new leaf
    const newLeaf = this.app.workspace.getMostRecentLeaf();
    if (activeLeaf && newLeaf && activeLeaf !== newLeaf) {
      newLeaf.detach();
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
