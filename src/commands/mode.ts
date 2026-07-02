import * as vscode from "vscode";
import { createCodeNoteFromRange } from "./addNote";
import { NoteStore } from "../services/noteStore";
import { SymbolService } from "../services/symbolService";
import { NoteType, noteTypes } from "../types/note";

let annotationMode = false;
let annotationType: NoteType = "normal";
let controller: AnnotationModeController | undefined;

export function isAnnotationMode(): boolean {
  return annotationMode;
}

export async function enterAnnotationMode(store: NoteStore, symbolService: SymbolService): Promise<void> {
  const pickedType = await vscode.window.showQuickPick(noteTypes, {
    placeHolder: "Choose the highlight type for continuous annotation mode"
  });
  if (!pickedType) {
    return;
  }

  annotationType = pickedType as NoteType;
  annotationMode = true;
  await vscode.commands.executeCommand("setContext", "codeNotes.annotationMode", true);

  controller?.dispose();
  controller = new AnnotationModeController(store, symbolService, annotationType);
  void vscode.window.showInformationMessage(`Code Notes continuous annotation mode enabled: ${annotationType}.`);
}

export async function exitAnnotationMode(): Promise<void> {
  annotationMode = false;
  await vscode.commands.executeCommand("setContext", "codeNotes.annotationMode", false);
  controller?.dispose();
  controller = undefined;
  void vscode.window.showInformationMessage("Code Notes annotation mode disabled.");
}

class AnnotationModeController implements vscode.Disposable {
  private readonly statusBar: vscode.StatusBarItem;
  private readonly disposables: vscode.Disposable[] = [];
  private timer: NodeJS.Timeout | undefined;
  private lastCreatedKey = "";
  private pendingEditor: vscode.TextEditor | undefined;

  constructor(
    private readonly store: NoteStore,
    private readonly symbolService: SymbolService,
    private readonly type: NoteType
  ) {
    this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    this.statusBar.text = `Code Notes: Annotating (${type})`;
    this.statusBar.tooltip = "Selections are automatically saved as highlights. Click to exit.";
    this.statusBar.command = "codeNotes.exitAnnotationMode";
    this.statusBar.show();

    this.disposables.push(
      this.statusBar,
      vscode.window.onDidChangeTextEditorSelection((event) => this.schedule(event.textEditor))
    );

    if (vscode.window.activeTextEditor && !vscode.window.activeTextEditor.selection.isEmpty) {
      this.schedule(vscode.window.activeTextEditor);
    }
  }

  dispose(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
  }

  private schedule(editor: vscode.TextEditor): void {
    if (!annotationMode || editor.selection.isEmpty || editor.document.uri.scheme !== "file") {
      return;
    }

    this.pendingEditor = editor;
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.timer = undefined;
      void this.createPendingHighlight();
    }, 450);
  }

  private async createPendingHighlight(): Promise<void> {
    const editor = this.pendingEditor;
    if (!annotationMode || !editor || editor.selection.isEmpty) {
      return;
    }

    const key = this.selectionKey(editor);
    if (key === this.lastCreatedKey) {
      return;
    }

    this.lastCreatedKey = key;
    await createCodeNoteFromRange({
      store: this.store,
      symbolService: this.symbolService,
      editor,
      type: this.type
    });
  }

  private selectionKey(editor: vscode.TextEditor): string {
    const selection = editor.selection;
    return [
      editor.document.uri.fsPath,
      selection.start.line,
      selection.start.character,
      selection.end.line,
      selection.end.character,
      this.type
    ].join(":");
  }
}
