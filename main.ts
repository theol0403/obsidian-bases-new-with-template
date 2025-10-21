import { Plugin, TFile, Notice } from "obsidian";
import { processTemplate } from "./templater";
import {
  BasesTemplateSettings,
  DEFAULT_SETTINGS,
  BasesTemplateSettingTab,
} from "./settings";

export default class BasesTemplatePlugin extends Plugin {
  settings: BasesTemplateSettings;
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new BasesTemplateSettingTab(this.app, this));

    this.app.workspace.onLayoutReady(() => {
      this.registerEvent(
        this.app.vault.on("create", async (file: TFile) => {
          // Only process files that start with "Untitled" (created by Bases)
          if (!file.basename.startsWith("Untitled")) return;

          // Wait for metadata cache to be populated
          await new Promise((resolve) => setTimeout(resolve, 150));
          const fm = this.app.metadataCache.getFileCache(file)?.frontmatter;
          if (!fm) return;

          // Check the configured template property
          const value = fm[this.settings.templateProperty];
          if (!value) return;

          const values = Array.isArray(value) ? value : [value];
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

            if (
              templatesEnabled &&
              templateFolder &&
              path.startsWith(templateFolder)
            ) {
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
            } else if (
              templaterEnabled &&
              templaterFolder &&
              path.startsWith(templaterFolder)
            ) {
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
        })
      );
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
