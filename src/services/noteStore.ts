import * as vscode from "vscode";
import * as path from "path";
import { CodeNote, CodeNotesFile, NoteType, noteTypes } from "../types/note";
import { getStorageUri, normalizeFsPath } from "../utils/path";

export class NoteStore implements vscode.Disposable {
  private readonly changedEmitter = new vscode.EventEmitter<void>();
  private notes = new Map<string, CodeNote>();
  private byFile = new Map<string, Set<string>>();
  private byType = new Map<NoteType, Set<string>>();
  private saveTimer: NodeJS.Timeout | undefined;
  private storageUri = getStorageUri();

  readonly onDidChange = this.changedEmitter.event;

  async load(): Promise<void> {
    this.storageUri = getStorageUri();
    this.notes.clear();
    this.byFile.clear();
    this.byType.clear();

    try {
      const data = await vscode.workspace.fs.readFile(this.storageUri);
      const parsed = JSON.parse(Buffer.from(data).toString("utf8")) as CodeNotesFile;
      for (const note of parsed.notes ?? []) {
        this.insertIndexes({ ...note, filePath: normalizeFsPath(note.filePath), highlightVisible: note.highlightVisible ?? true });
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "FileNotFound") {
        console.warn("Code Notes: failed to load store", error);
      }
    }
  }

  all(): CodeNote[] {
    return [...this.notes.values()].sort((a, b) => a.createdAt - b.createdAt);
  }

  get(id: string): CodeNote | undefined {
    return this.notes.get(id);
  }

  getByFile(filePath: string): CodeNote[] {
    const key = normalizeFsPath(filePath);
    return this.idsToNotes(this.byFile.get(key));
  }

  getByType(type: NoteType): CodeNote[] {
    return this.idsToNotes(this.byType.get(type));
  }

  getActiveVisibleByFile(filePath: string): CodeNote[] {
    return this.getByFile(filePath).filter((note) => note.status === "active" && note.highlightVisible);
  }

  async add(note: CodeNote): Promise<void> {
    this.insertIndexes({ ...note, filePath: normalizeFsPath(note.filePath) });
    this.scheduleSave();
    this.changedEmitter.fire();
  }

  async update(note: CodeNote): Promise<void> {
    const old = this.notes.get(note.id);
    if (old) {
      this.removeIndexes(old);
    }
    this.insertIndexes({ ...note, filePath: normalizeFsPath(note.filePath), updatedAt: Date.now() });
    this.scheduleSave();
    this.changedEmitter.fire();
  }

  async updateMany(notes: CodeNote[]): Promise<void> {
    for (const note of notes) {
      const old = this.notes.get(note.id);
      if (old) {
        this.removeIndexes(old);
      }
      this.insertIndexes({ ...note, filePath: normalizeFsPath(note.filePath), updatedAt: Date.now() });
    }
    this.scheduleSave();
    this.changedEmitter.fire();
  }

  async flush(): Promise<void> {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = undefined;
    }
    await this.save();
  }

  dispose(): void {
    this.changedEmitter.dispose();
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
  }

  private insertIndexes(note: CodeNote): void {
    this.notes.set(note.id, note);
    this.addToIndex(this.byFile, note.filePath, note.id);
    this.addToIndex(this.byType, note.type, note.id);
  }

  private removeIndexes(note: CodeNote): void {
    this.notes.delete(note.id);
    this.byFile.get(note.filePath)?.delete(note.id);
    this.byType.get(note.type)?.delete(note.id);
  }

  private addToIndex<K>(index: Map<K, Set<string>>, key: K, id: string): void {
    let set = index.get(key);
    if (!set) {
      set = new Set<string>();
      index.set(key, set);
    }
    set.add(id);
  }

  private idsToNotes(ids: Set<string> | undefined): CodeNote[] {
    if (!ids) {
      return [];
    }
    return [...ids].map((id) => this.notes.get(id)).filter((note): note is CodeNote => Boolean(note));
  }

  private scheduleSave(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
    this.saveTimer = setTimeout(() => {
      void this.save();
    }, 250);
  }

  private async save(): Promise<void> {
    this.saveTimer = undefined;
    const folder = vscode.Uri.file(path.dirname(this.storageUri.fsPath));
    await vscode.workspace.fs.createDirectory(folder);

    const payload: CodeNotesFile = {
      version: 1,
      updatedAt: Date.now(),
      notes: this.all()
    };
    const tmp = vscode.Uri.file(`${this.storageUri.fsPath}.tmp`);
    await vscode.workspace.fs.writeFile(tmp, Buffer.from(`${JSON.stringify(payload, null, 2)}\n`, "utf8"));
    await vscode.workspace.fs.rename(tmp, this.storageUri, { overwrite: true });

    for (const type of noteTypes) {
      this.byType.set(type, this.byType.get(type) ?? new Set<string>());
    }
  }
}
