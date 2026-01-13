# At-Mention Linker - Usage Example

## Test Scenario

Imagine you have the following notes in your vault:

1. `John Doe.md` - A note about John
2. `Project Alpha.md` - With frontmatter:
   ```yaml
   ---
   aliases: [ProjectA, Alpha]
   ---
   ```

## Before Conversion

When you type the following in a note:

```
I met with @John Doe to discuss @ProjectA today.
We also talked about @Alpha and future plans.
```

## After Saving

The plugin automatically converts it to:

```
I met with [[John Doe]] to discuss [[Project Alpha]] today.
We also talked about [[Project Alpha]] and future plans.
```

## How It Works

1. **On Save**: The plugin listens for file modifications (saves)
2. **Pattern Detection**: Finds all `@mention` patterns using regex
3. **Link Resolution**: 
   - First tries Obsidian's native link resolution
   - Falls back to cached alias map if needed
4. **Conversion**: Replaces `@mention` with `[[Note Name]]`
5. **Preservation**: Leaves unmatched mentions unchanged

## Manual Conversion

You can also manually trigger conversion:

1. Open Command Palette (Ctrl/Cmd + P)
2. Type "Convert @mentions to links"
3. Press Enter

This is useful when you want to convert mentions without saving.

## Performance

- Initial alias map is built once when plugin loads
- Map is automatically updated when:
  - Files are renamed
  - Files are deleted
  - Frontmatter metadata changes
- No full-vault scans on each save
- Constant-time lookup for alias resolution
