import * as vscode from "vscode";
import { NoteStore } from "../services/noteStore";
import { intersects, normalizeSelection } from "../utils/range";

export async function deleteHighlightCommand(store: NoteStore): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const range = normalizeSelection(editor.selection);
  if (!range) {
    void vscode.window.showWarningMessage("Select a highlighted range to remove its highlight.");
    return;
  }

  const matches = store
    .getActiveVisibleByFile(editor.document.uri.fsPath)
    .filter((note) => intersects(note.range, range));

  if (matches.length === 0) {
    void vscode.window.showInformationMessage("No active highlights intersect the selection.");
    return;
  }

  await store.updateMany(matches.map((note) => ({ ...note, highlightVisible: false, status: "stale" as const })));
}
