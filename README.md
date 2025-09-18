# Obsidian Bases New with Template

Obsidian plugin implementing a temporary solution to automatically apply
templates when creating new entries with the Bases plugin.

This plugin implements the behavior requested in
[Bases: New With Template (for ‘New’ Button)](https://forum.obsidian.md/t/bases-new-with-template-for-new-button/102639).

## What It Does

If you create a filter in your Bases view with a `template` property linking to
a template, Bases will create a new note with the implied
`template: [[TemplateName]]` property in the frontmatter.

This plugin listens for file creation and checks for an existing `template`
property in the frontmatter. If it finds it, it applies the template content.

Works with both Core Templates and Templater plugins, and uses the appropriate
engine to apply the template.

Please note:

- When using a Core Template, the plugin bypasses the new note popup window and
  opens the note in full screen, this is to avoid
  [this issue](https://forum.obsidian.md/t/bases-applying-template-in-new-entry-popup-doesnt-apply-properties/105802).
- The nature of using a filter means that the base won't show items that were
  NOT created by the New button. To mitigate this, add a
  `template: [[TemplateName]]` self-link property to the template itself so that
  the note shows up in the base when applying a template in the regular way.
- The plugin only applies to new notes starting with "Untitled" (eg the note was
  created by Bases).

## Setup

### 1. Create Templates

Place your template (e.g., `ProjectTemplate.md`) in

- Core Templates: Settings → Core Plugins → Templates → Template folder
- Templater: Settings → Community Plugins → Templater → Templates folder

If both are installed and point to the same folder, the plugin will use core
templates.

### 2. Configure Bases View with Implied Properties

This plugin relies on the Bases implied properties feature to work:

1. **Open or create a Base** (`.base` file or via Bases plugin UI)
2. **Add a filter** with a property linking to your template:
   ![Filter Example](<CleanShot 2025-09-17 at 19.21.40.png>)
3. **New notes created** via the "New" button will include
   `template: [[ProjectTemplate]]` in their frontmatter

### 3. Create Notes

1. In your Bases view, click the **"New"** button
2. The plugin detects `template: [[ProjectTemplate]]` in the frontmatter
3. Template content is automatically applied to the new note

## Installation

### Using BRAT (Recommended)

1. Install the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat)
2. Open BRAT settings in Obsidian
3. Click "Add Beta Plugin"
4. Enter: `theol0403/obsidian-bases-new-with-template`
5. Enable the plugin in Settings → Community Plugins

### Manual Installation

1. Download the latest release from
   [GitHub releases](https://github.com/theol0403/obsidian-bases-new-with-template/releases)
2. Extract to `VaultFolder/.obsidian/plugins/bases-new-with-template/`
3. Enable in Settings → Community Plugins

### Development

```bash
npm install
npm run build
npm run dev
```
