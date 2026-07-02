import * as vscode from "vscode";
import { addNoteCommand } from "./commands/addNote";
import { deleteHighlightCommand } from "./commands/deleteHighlight";
import { enterAnnotationMode, exitAnnotationMode } from "./commands/mode";
import { selectProjectRootCommand } from "./commands/selectProjectRoot";
import { CodeNotesHoverProvider } from "./providers/hoverProvider";
import { DecorationService } from "./services/decorationService";
import { ExportService } from "./services/exportService";
import { MigrationService } from "./services/migrationService";
import { NoteStore } from "./services/noteStore";
import { SearchService } from "./services/searchService";
import { SymbolService } from "./services/symbolService";

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const store = new NoteStore();
  await store.load();

  const symbolService = new SymbolService();
  const decorationService = new DecorationService(store);
  const searchService = new SearchService(store);
  const exportService = new ExportService(store);
  const migrationService = new MigrationService(store);

  context.subscriptions.push(
    store,
    decorationService,
    migrationService,
    vscode.languages.registerHoverProvider({ scheme: "file" }, new CodeNotesHoverProvider(store)),
    vscode.commands.registerCommand("codeNotes.addNote", () => addNoteCommand(store, symbolService, true)),
    vscode.commands.registerCommand("codeNotes.addHighlight", () => addNoteCommand(store, symbolService, false)),
    vscode.commands.registerCommand("codeNotes.deleteHighlight", () => deleteHighlightCommand(store)),
    vscode.commands.registerCommand("codeNotes.searchNotes", () => searchService.searchAndOpen()),
    vscode.commands.registerCommand("codeNotes.exportNotes", () => exportService.exportByType()),
    vscode.commands.registerCommand("codeNotes.exportNotesForResource", (resource?: vscode.Uri) => exportService.exportByType(resource)),
    vscode.commands.registerCommand("codeNotes.selectProjectRoot", (resource?: vscode.Uri) => selectProjectRootCommand(store, decorationService, resource)),
    vscode.commands.registerCommand("codeNotes.openNote", (id: string) => searchService.openNote(id)),
    vscode.commands.registerCommand("codeNotes.migrateNotes", () => {
      const editor = vscode.window.activeTextEditor;
      return editor ? migrationService.migrateSelectedStaleNote(editor) : undefined;
    }),
    vscode.commands.registerCommand("codeNotes.enterAnnotationMode", () => enterAnnotationMode(store, symbolService)),
    vscode.commands.registerCommand("codeNotes.exitAnnotationMode", exitAnnotationMode),
    { dispose: () => void store.flush() }
  );

  decorationService.refreshVisibleEditors();
}

export function deactivate(): void {}
