import * as vscode from "vscode";
import { NoteStore } from "./noteStore";
import { sha256 } from "../utils/hash";
import { toVsCodeRange, normalizeSelection } from "../utils/range";

export class MigrationService implements vscode.Disposable {
  private readonly disposables: vscode.Disposable[] = [];
  private readonly timers = new Map<string, NodeJS.Timeout>();

  constructor(private readonly store: NoteStore) {
    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument((event) => this.scheduleStaleCheck(event.document)),
      vscode.workspace.onDidOpenTextDocument((document) => this.scheduleStaleCheck(document))
    );
  }

  async markChangedRangesStale(document: vscode.TextDocument): Promise<void> {
    const updates = this.store
      .getActiveVisibleByFile(document.uri.fsPath)
      .filter((note) => {
        try {
          const text = document.getText(toVsCodeRange(note.range));
          return sha256(text) !== note.originalTextHash;
        } catch {
          return true;
        }
      })
      .map((note) => ({
        ...note,
        status: "stale" as const,
        highlightVisible: false
      }));

    if (updates.length > 0) {
      await this.store.updateMany(updates);
    }
  }

  async migrateSelectedStaleNote(editor: vscode.TextEditor): Promise<void> {
    const range = normalizeSelection(editor.selection);
    if (!range) {
      void vscode.window.showWarningMessage("Select the new code range before migrating a stale note.");
      return;
    }

    const staleNotes = this.store
      .getByFile(editor.document.uri.fsPath)
      .filter((note) => note.status === "stale");

    if (staleNotes.length === 0) {
      void vscode.window.showInformationMessage("No stale notes found for this file.");
      return;
    }

    const picked = await vscode.window.showQuickPick(
      staleNotes.map((note) => ({
        label: note.note?.split(/\r?\n/)[0] || `${note.type} note`,
        description: note.symbol?.name ?? "unknown",
        detail: note.id,
        note
      })),
      { placeHolder: "Choose the stale note to attach to the current selection" }
    );

    if (!picked) {
      return;
    }

    await this.store.update({
      ...picked.note,
      range: {
        startLine: range.start.line,
        startChar: range.start.character,
        endLine: range.end.line,
        endChar: range.end.character
      },
      originalTextHash: sha256(editor.document.getText(range)),
      status: "active",
      highlightVisible: true
    });
  }

  dispose(): void {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
  }

  private scheduleStaleCheck(document: vscode.TextDocument): void {
    const key = document.uri.toString();
    const existing = this.timers.get(key);
    if (existing) {
      clearTimeout(existing);
    }

    this.timers.set(
      key,
      setTimeout(() => {
        this.timers.delete(key);
        void this.markChangedRangesStale(document);
      }, 300)
    );
  }
}
