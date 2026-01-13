# At-Mention Linker

An Obsidian plugin that automatically converts `@name` mentions to wiki-style links `[[Page]]` when you save a file.

## Features

- **Auto-conversion on save**: When you save a markdown file, any `@name` patterns are automatically converted to `[[Page]]` links if a matching note or alias exists
- **Manual command**: Use the command palette to run "Convert @mentions to links in active file" to convert mentions on demand
- **Smart resolution**: Uses Obsidian's built-in link resolution system for correctness
- **Alias support**: Recognizes frontmatter aliases (both `alias` and `aliases` fields)
- **Performance optimized**: Uses a cached alias index that updates automatically with vault changes - no full-vault scans on each save

## How it works

1. Type `@NoteName` in your document
2. Save the file (Ctrl/Cmd + S)
3. If "NoteName" matches an existing note name or alias, it's automatically converted to `[[NoteName]]`

The plugin intelligently resolves mentions by:
- First trying Obsidian's native link resolution (handles relative paths, etc.)
- Then checking against a cached map of note names and frontmatter aliases
- Leaving unmatched mentions unchanged

## Installation

### Manual Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the latest release
2. Create a folder named `at-mention-linker` in your vault's `.obsidian/plugins/` directory
3. Copy the downloaded files into that folder
4. Reload Obsidian and enable the plugin in Settings → Community Plugins

### Development

Clone this repo into your vault's `.obsidian/plugins/` folder:

```bash
cd /path/to/your/vault/.obsidian/plugins
git clone https://github.com/mmanela/obsidian-at-mention.git at-mention-linker
cd at-mention-linker
npm install
npm run build
```

## Usage

### Automatic conversion
Simply type `@mention` in your notes and save. Matching mentions are automatically converted to links.

### Manual conversion
Open the command palette (Ctrl/Cmd + P) and run "Convert @mentions to links in active file".

## Example

Given notes:
- `John Doe.md`
- `Project Alpha.md` with frontmatter `aliases: [ProjectA, Alpha]`

Typing and saving:
```
Met with @John Doe about @ProjectA
```

Automatically becomes:
```
Met with [[John Doe]] about [[Project Alpha]]
```

## Building

```bash
npm run build
```

## Development

```bash
npm run dev
```

This will watch for changes and rebuild automatically.
