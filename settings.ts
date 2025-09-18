import { App, PluginSettingTab, Setting } from "obsidian";
import type BasesTemplatePlugin from "./main";

export interface BasesTemplateSettings {
  templateProperty: string;
}

export const DEFAULT_SETTINGS: BasesTemplateSettings = {
  templateProperty: "template",
};

export class BasesTemplateSettingTab extends PluginSettingTab {
  plugin: BasesTemplatePlugin;

  constructor(app: App, plugin: BasesTemplatePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Bases Template Plugin Settings" });

    new Setting(containerEl)
      .setName("Template property")
      .setDesc(
        "Frontmatter property to check for template links. Defaults to 'template'."
      )
      .addText((text) =>
        text
          .setPlaceholder("template")
          .setValue(this.plugin.settings.templateProperty)
          .onChange(async (value) => {
            this.plugin.settings.templateProperty = value.trim() || "template";
            await this.plugin.saveSettings();
          })
      );
  }
}
