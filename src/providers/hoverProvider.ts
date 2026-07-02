import * as vscode from "vscode";
import { NoteStore } from "../services/noteStore";
import { noteHoverMarkdown } from "../utils/markdown";
import { toVsCodeRange } from "../utils/range";

export class CodeNotesHoverProvider implements vscode.HoverProvider {
  constructor(private readonly store: NoteStore) {}

  provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.Hover> {
    if (!vscode.workspace.getConfiguration("codeNotes").get<boolean>("hover.enable", true)) {
      return undefined;
    }

    const notes = this.store
      .getActiveVisibleByFile(document.uri.fsPath)
      .filter((note) => toVsCodeRange(note.range).contains(position));

    if (notes.length === 0) {
      return undefined;
    }

    return new vscode.Hover(notes.map(noteHoverMarkdown));
  }
}
