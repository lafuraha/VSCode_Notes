import * as vscode from "vscode";
import { NoteStore } from "./noteStore";
import { lineLabel, toVsCodeRange } from "../utils/range";
import { asWorkspaceRelative } from "../utils/path";

export class SearchService {
  constructor(private readonly store: NoteStore) {}

  async searchAndOpen(): Promise<void> {
    const items = this.store.all().map((note) => ({
      label: `${note.type}: ${note.note?.split(/\r?\n/)[0] || "Highlight only"}`,
      description: `${note.status} · ${lineLabel(note.range)}`,
      detail: `${asWorkspaceRelative(note.filePath, note.workspaceRoot)} · ${note.symbol?.name ?? "unknown"}`,
      note
    }));

    const picked = await vscode.window.showQuickPick(items, {
      matchOnDescription: true,
      matchOnDetail: true,
      placeHolder: "Search notes by text, file, symbol, type, or status"
    });

    if (picked) {
      await this.openNote(picked.note.id);
    }
  }

  async openNote(id: string): Promise<void> {
    const note = this.store.get(id);
    if (!note) {
      void vscode.window.showWarningMessage("Code note not found.");
      return;
    }

    const document = await vscode.workspace.openTextDocument(vscode.Uri.file(note.filePath));
    const editor = await vscode.window.showTextDocument(document, { preview: false });
    const range = toVsCodeRange(note.range);
    editor.selection = new vscode.Selection(range.start, range.end);
    editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
  }
}
