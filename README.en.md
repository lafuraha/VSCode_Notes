# Code Notes

**English** | [简体中文](README.md)  


Code Notes is a VS Code extension for highlighting code, attaching Markdown notes, searching notes, migrating stale annotations, and exporting structured Markdown files by note type.

It is designed for code reading, source walkthroughs, refactoring notes, debugging sessions, and learning notes.

## Core Workflow

```txt
Select code
  -> Add a highlight or note
  -> See the highlighted range in the editor
  -> Notes show a gutter bookmark
  -> Hover to preview Markdown
  -> Search or open the note location
  -> Export Markdown grouped by type
```

## Quick Start

Open a code file, select a range, then use:

- `Ctrl+Alt+N`: Add a note
- `Ctrl+Alt+H`: Add a plain highlight
- Editor context menu: `Code Notes: Add Note` or `Code Notes: Add Highlight`

When adding a note, you choose a type and enter Markdown content. When adding a plain highlight, only the highlighted range is saved.

Supported types:

- `normal`
- `todo`
- `important`
- `bug`

## Highlight vs Note

Plain highlight:

- Shows only the background color
- Does not show a gutter bookmark
- Works well for quick and repeated code marking

Note:

- Shows the background color
- Shows a gutter bookmark
- Renders Markdown in hover
- Can be searched and opened quickly
- Includes note content in Markdown export

## Continuous Annotation Mode

Run:

```txt
Code Notes: Enter Annotation Mode
```

Choose the highlight type for the current session, such as `important`. After that, every stable non-empty code selection is saved automatically as a plain highlight.

To stop:

- Run `Code Notes: Exit Annotation Mode`
- Click the `Code Notes: Annotating (...)` status bar item

Continuous mode is meant for fast code reading and batch highlighting. It does not open a note input box and does not create gutter bookmarks.

## Hover, Search, and Jump

Hover over a noted code range to preview its Markdown content.

Run:

```txt
Code Notes: Search Notes
```

You can search by note text, file path, symbol, type, or status. Selecting an item opens the file and reveals the original range.

## Delete Highlight

Select an existing highlighted range and run:

```txt
Code Notes: Delete Highlight in Selection
```

This only hides the highlight. It does not delete the note data. The record is kept as `stale` so it can be recovered or manually migrated later.

## Code Changes and Stale Notes

The extension does not automatically guess where moved code went.

When the original code text changes:

- The highlight becomes inactive
- The note data is kept
- The note status becomes `stale`
- The user decides whether to migrate it

Manual migration:

1. Select the new code range
2. Run `Code Notes: Migrate Stale Notes`
3. Choose the stale note to attach to the new range

## Select Project Root

If you sometimes open a parent folder and sometimes open a child folder, set an explicit project root first.

Run:

```txt
Code Notes: Select Project Root
```

You can also right-click a file or folder in Explorer and run the same command.

The extension lists all parent directories for the selected path. Choose the directory that should own the shared note store. After that, notes are stored at:

```txt
<projectRoot>/.vscode/code-notes.json
```

This lets the same notes and highlights work whether the project is opened from the parent folder or a child folder.

## Export Markdown

Export all project notes:

```txt
Code Notes: Export Markdown by Type
```

Default output:

```txt
notes/
  normal.md
  todo.md
  important.md
  bug.md
```

To export notes only for a specific file or folder, right-click it in Explorer and run:

```txt
Code Notes: Generate Notes for File/Folder
```

Folder export writes to:

```txt
<folder>/notes/
```

File export writes to:

```txt
<file-folder>/notes/<file-name>/
```

Each exported note includes:

- File path
- Function/class/method symbol
- Line range
- VS Code open link
- Markdown note content
- Code context before and after the range

## Common Settings

```json
{
  "codeNotes.colors.normal": "rgba(255, 235, 59, 0.35)",
  "codeNotes.colors.todo": "rgba(255, 193, 7, 0.35)",
  "codeNotes.colors.important": "rgba(129, 212, 250, 0.35)",
  "codeNotes.colors.bug": "rgba(244, 67, 54, 0.25)",

  "codeNotes.hover.enable": true,

  "codeNotes.export.headLines": 3,
  "codeNotes.export.tailLines": 3,

  "codeNotes.symbol.enable": true,

  "codeNotes.storagePath": ".vscode/code-notes.json",
  "codeNotes.projectRoot": ""
}
```

Settings:

- `codeNotes.colors.*`: Highlight colors for each note type
- `codeNotes.hover.enable`: Enable or disable Markdown hover previews
- `codeNotes.export.headLines`: Number of context lines before the range in export
- `codeNotes.export.tailLines`: Number of context lines after the range in export
- `codeNotes.symbol.enable`: Try to attach the nearest function/class/method symbol
- `codeNotes.storagePath`: JSON note store path
- `codeNotes.projectRoot`: Explicit project root directory

## Data File

Notes are stored by default at:

```txt
.vscode/code-notes.json
```

This is a regular JSON file. You can commit it to the repository for team sharing, or add it to `.gitignore` for personal notes.

## Development

```bash
npm install
npm run compile
```

Then press F5 in VS Code to launch the Extension Host.
