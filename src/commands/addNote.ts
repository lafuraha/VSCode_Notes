import * as vscode from "vscode";
import { NoteStore } from "../services/noteStore";
import { SymbolService } from "../services/symbolService";
import { CodeNote, NoteType, noteTypes } from "../types/note";
import { createId, sha256 } from "../utils/hash";
import { fromVsCodeRange, normalizeSelection } from "../utils/range";
import { getWorkspaceRoot, normalizeFsPath } from "../utils/path";

export async function addNoteCommand(store: NoteStore, symbolService: SymbolService, withMarkdown: boolean): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const range = normalizeSelection(editor.selection);
  if (!range) {
    void vscode.window.showWarningMessage("Select code before adding a Code Note.");
    return;
  }

  const pickedType = await vscode.window.showQuickPick(noteTypes, { placeHolder: "Choose note type" });
  if (!pickedType) {
    return;
  }

  const markdown = withMarkdown
    ? await vscode.window.showInputBox({
        prompt: "Markdown note",
        placeHolder: "Why is this code important?"
      })
    : undefined;

  if (withMarkdown && markdown === undefined) {
    return;
  }

  await createCodeNoteFromRange({
    store,
    symbolService,
    editor,
    type: pickedType as NoteType,
    note: markdown
  });
}

export async function createCodeNoteFromRange(options: {
  store: NoteStore;
  symbolService: SymbolService;
  editor: vscode.TextEditor;
  type: NoteType;
  note?: string;
}): Promise<CodeNote | undefined> {
  const range = normalizeSelection(options.editor.selection);
  if (!range) {
    return undefined;
  }

  const document = options.editor.document;
  const now = Date.now();
  const note: CodeNote = {
    id: createId(),
    filePath: normalizeFsPath(document.uri.fsPath),
    workspaceRoot: getWorkspaceRoot(document.uri),
    range: fromVsCodeRange(range),
    symbol: await options.symbolService.findNearestSymbol(document, range),
    type: options.type,
    note: options.note,
    originalTextHash: sha256(document.getText(range)),
    status: "active",
    highlightVisible: true,
    createdAt: now,
    updatedAt: now
  };

  await options.store.add(note);
  return note;
}
