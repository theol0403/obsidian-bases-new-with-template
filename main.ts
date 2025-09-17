import { Plugin, TFile, Notice } from "obsidian";
import { processTemplate } from "./templater";

export default class BasesTemplatePlugin extends Plugin {
  async onload() {
    this.app.workspace.onLayoutReady(() => {
      this.registerEvent(
        this.app.vault.on("create", async (file: TFile) => {
          // Wait for metadata cache to be populated
          await new Promise((resolve) => setTimeout(resolve, 100));
          const fm = this.app.metadataCache.getFileCache(file)?.frontmatter;
          if (!fm) return;

          for (const value of Object.values(fm)) {
            const values = Array.isArray(value) ? value : [value];

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
              const templatesEnabled = !!(this.app as any).internalPlugins
                .plugins.templates?.enabled;
              const templaterEnabled = !!(this.app as any).plugins.plugins[
                "templater-obsidian"
              ];
              const templateFolder = (
                this.app as any
              ).internalPlugins.plugins.templates?.instance.options.folder?.toLowerCase();
              const templaterFolder = (this.app as any).plugins.plugins[
                "templater-obsidian"
              ]?.settings?.templates_folder?.toLowerCase();

              // Open the file first to ensure it's the active file
              // This is necessary until https://forum.obsidian.md/t/bases-applying-template-in-new-entry-popup-doesnt-apply-properties/105802 is solved
              await this.app.workspace.openLinkText(file.path, "", false);

              if (
                templatesEnabled &&
                templateFolder &&
                path.startsWith(templateFolder)
              ) {
                await (
                  this.app as any
                ).internalPlugins.plugins.templates.instance.insertTemplate(
                  templateFile
                );
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
          }
        })
      );
    });
  }
}
