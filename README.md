# Bases Template Plugin

An Obsidian plugin that automatically applies templates based on frontmatter
links in newly created files.

## Features

- **Automatic Template Application**: When you create a new file with a template
  link in the frontmatter (e.g., `template: [[My Template]]`), the plugin
  automatically applies that template
- **Dual Engine Support**: Works with both Obsidian's core Templates plugin and
  the Templater community plugin
- **Smart Detection**: Automatically determines which templating engine to use
  based on the template file's location
- **Error Handling**: Provides clear notifications when templates are not found
  or when errors occur

## How It Works

1. **File Creation**: When you create a new file in Obsidian
2. **Frontmatter Scanning**: The plugin scans the file's frontmatter for
   template links in the format `[[Template Name]]`
3. **Template Location**: It locates the referenced template file
4. **Engine Detection**: Determines whether to use Core Templates or Templater
   based on the template's folder location
5. **Template Application**: Applies the template using the appropriate engine

## Installation

### Manual Installation

1. Download the latest release from the releases page
2. Extract the files to your vault's plugins folder:
   `VaultFolder/.obsidian/plugins/bases-template-plugin/`
3. Reload Obsidian
4. Enable the plugin in Settings → Community Plugins

### Development Installation

1. Clone this repository into your vault's plugins folder
2. Navigate to the plugin directory
3. Run `npm install` to install dependencies
4. Run `npm run dev` to start development mode with hot reloading
5. Enable the plugin in Obsidian

## Usage

### Basic Usage

Create a new file with frontmatter containing a template link:

```markdown
---
template: [[Daily Note Template]]
title: My New Note
---

# Content will be replaced by template
```

When you save this file, the plugin will automatically apply the "Daily Note
Template" and replace the content.

### Supported Frontmatter Formats

The plugin looks for template links in any frontmatter field:

```yaml
---
template: [[My Template]]
---
```

```yaml
---
type: [[Project Template]]
---
```

```yaml
---
base: [[Meeting Template]]
category: work
---
```

### Template Engine Requirements

#### Core Templates Plugin

- Template files must be located in the folder specified in Templates plugin
  settings
- Templates will be processed using Obsidian's built-in template variables

#### Templater Plugin

- Template files must be located in the folder specified in Templater plugin
  settings
- Templates will be processed with full Templater functionality including custom
  scripts

## Configuration

The plugin works automatically with your existing template plugin
configurations:

1. **Core Templates**: Set up your template folder in Settings → Core Plugins →
   Templates
2. **Templater**: Configure your template folder in Settings → Community Plugins
   → Templater

## Development

### Building

```bash
# Install dependencies
npm install

# Development build with watching
npm run dev

# Production build
npm run build

# Version bump (updates manifest.json and versions.json)
npm run version
```

### Project Structure

```
├── main.ts              # Main plugin class
├── templater.ts          # Templater integration utilities
├── manifest.json         # Plugin manifest
├── package.json          # Node.js dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── esbuild.config.mjs    # Build configuration
└── version-bump.mjs      # Version management script
```

### Code Architecture

- **BasesTemplatePlugin**: Main plugin class that handles file creation events
- **processTemplate**: Utility function for processing Templater templates
- **Event-driven**: Uses Obsidian's vault events to trigger template processing
- **Error Handling**: Comprehensive error handling with user notifications

## Troubleshooting

### Template Not Applied

- Ensure the template file exists and the link is correct
- Check that the template is in the correct folder for your templating plugin
- Verify that either Core Templates or Templater plugin is enabled

### Templater Issues

- Make sure Templater plugin is installed and enabled
- Check that template files are in the Templater templates folder
- Review console for detailed error messages

### Core Templates Issues

- Ensure Core Templates plugin is enabled
- Verify template files are in the Templates folder
- Check template folder path in plugin settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with appropriate tests
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

If you encounter issues or have feature requests, please create an issue on the
GitHub repository.
