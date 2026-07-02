import * as vscode from "vscode";
import { NoteStore } from "./noteStore";
import { NoteType, noteTypes } from "../types/note";
import { toVsCodeRange } from "../utils/range";
import { noteHoverMarkdown } from "../utils/markdown";

export class DecorationService implements vscode.Disposable {
  private readonly highlightDecorationTypes = new Map<NoteType, vscode.TextEditorDecorationType>();
  private readonly noteDecorationTypes = new Map<NoteType, vscode.TextEditorDecorationType>();
  private readonly disposables: vscode.Disposable[] = [];

  constructor(private readonly store: NoteStore) {
    this.rebuildDecorationTypes();
    this.disposables.push(
      this.store.onDidChange(() => this.refreshVisibleEditors()),
      vscode.window.onDidChangeVisibleTextEditors(() => this.refreshVisibleEditors()),
      vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("codeNotes.colors")) {
          this.rebuildDecorationTypes();
          this.refreshVisibleEditors();
        }
      })
    );
  }

  refreshVisibleEditors(): void {
    for (const editor of vscode.window.visibleTextEditors) {
      this.refreshEditor(editor);
    }
  }

  refreshEditor(editor: vscode.TextEditor): void {
    const notes = this.store.getActiveVisibleByFile(editor.document.uri.fsPath);
    const hoverEnabled = vscode.workspace.getConfiguration("codeNotes").get<boolean>("hover.enable", true);

    for (const type of noteTypes) {
      const typedNotes = notes.filter((note) => note.type === type);
      const highlightOnlyOptions = typedNotes
        .filter((note) => !this.hasMarkdownNote(note.note))
        .map((note) => ({
          range: toVsCodeRange(note.range),
          hoverMessage: hoverEnabled ? noteHoverMarkdown(note) : undefined
        }));
      const noteOptions = typedNotes
        .filter((note) => this.hasMarkdownNote(note.note))
        .map((note) => ({
          range: toVsCodeRange(note.range),
          hoverMessage: hoverEnabled ? noteHoverMarkdown(note) : undefined
        }));

      editor.setDecorations(this.highlightDecorationTypes.get(type)!, highlightOnlyOptions);
      editor.setDecorations(this.noteDecorationTypes.get(type)!, noteOptions);
    }
  }

  dispose(): void {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
    for (const type of this.highlightDecorationTypes.values()) {
      type.dispose();
    }
    for (const type of this.noteDecorationTypes.values()) {
      type.dispose();
    }
  }

  private rebuildDecorationTypes(): void {
    for (const type of this.highlightDecorationTypes.values()) {
      type.dispose();
    }
    for (const type of this.noteDecorationTypes.values()) {
      type.dispose();
    }
    this.highlightDecorationTypes.clear();
    this.noteDecorationTypes.clear();

    const config = vscode.workspace.getConfiguration("codeNotes.colors");
    const icon = this.gutterIconDataUri();
    for (const type of noteTypes) {
      const color = config.get<string>(type, this.defaultColor(type));
      this.highlightDecorationTypes.set(
        type,
        vscode.window.createTextEditorDecorationType({
          backgroundColor: color,
          isWholeLine: false,
          overviewRulerColor: color,
          overviewRulerLane: vscode.OverviewRulerLane.Right
        })
      );
      this.noteDecorationTypes.set(
        type,
        vscode.window.createTextEditorDecorationType({
          backgroundColor: color,
          isWholeLine: false,
          overviewRulerColor: color,
          overviewRulerLane: vscode.OverviewRulerLane.Right,
          gutterIconPath: icon,
          gutterIconSize: "contain"
        })
      );
    }
  }

  private hasMarkdownNote(note: string | undefined): boolean {
    return Boolean(note?.trim());
  }

  private defaultColor(type: NoteType): string {
    switch (type) {
      case "todo":
        return "rgba(255, 193, 7, 0.35)";
      case "important":
        return "rgba(129, 212, 250, 0.35)";
      case "bug":
        return "rgba(244, 67, 54, 0.25)";
      default:
        return "rgba(255, 235, 59, 0.35)";
    }
  }

  private gutterIconDataUri(): vscode.Uri {
    const svg = encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14"><path fill="#f5c542" d="M3 1.5h8v11L7 10 3 12.5z"/></svg>`
    );
    return vscode.Uri.parse(`data:image/svg+xml,${svg}`);
  }
}
