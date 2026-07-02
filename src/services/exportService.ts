import * as path from "path";
import * as vscode from "vscode";
import { NoteStore } from "./noteStore";
import { CodeNote, noteTypes } from "../types/note";
import { exportNoteMarkdown } from "../utils/markdown";
import { getProjectRoot, normalizeFsPath } from "../utils/path";

export class ExportService {
  constructor(private readonly store: NoteStore) {}

  async exportByType(resource?: vscode.Uri): Promise<void> {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders?.length) {
      void vscode.window.showWarningMessage("Open a workspace before exporting Code Notes.");
      return;
    }

    const root = getProjectRoot();
    const scope = resource ? await this.resolveScope(resource, root) : undefined;
    const outputDir = scope ? scope.outputDir : vscode.Uri.file(path.join(root, "notes"));
    await vscode.workspace.fs.createDirectory(outputDir);

    const headLines = vscode.workspace.getConfiguration("codeNotes.export").get<number>("headLines", 3);
    const tailLines = vscode.workspace.getConfiguration("codeNotes.export").get<number>("tailLines", 3);

    for (const type of noteTypes) {
      const notes = this.store.getByType(type).filter((note) => this.isInScope(note, scope));
      const chunks: string[] = [`# ${this.title(type)} Notes`, "", "---", ""];

      for (const note of notes) {
        const document = await vscode.workspace.openTextDocument(vscode.Uri.file(note.filePath));
        const startLine = Math.max(0, note.range.startLine - headLines);
        const endLine = Math.min(document.lineCount - 1, note.range.endLine + tailLines);
        const codeRange = new vscode.Range(
          new vscode.Position(startLine, 0),
          document.lineAt(endLine).range.end
        );
        const codeBlock = document.getText(codeRange);
        const languageId = document.languageId === "plaintext" ? "" : document.languageId;
        chunks.push(exportNoteMarkdown(note, note.workspaceRoot, codeBlock, languageId));

        if (note.status === "stale") {
          chunks.push("> Status: stale. The original range is not currently highlighted.", "");
        }

      }

      const file = vscode.Uri.joinPath(outputDir, `${type}.md`);
      await vscode.workspace.fs.writeFile(file, Buffer.from(`${chunks.join("\n").trim()}\n`, "utf8"));
    }

    const scopeLabel = scope ? ` for ${scope.label}` : "";
    void vscode.window.showInformationMessage(`Code Notes exported${scopeLabel} to ${outputDir.fsPath}`);
  }

  private async resolveScope(resource: vscode.Uri, workspaceRoot: string): Promise<{ target: string; isDirectory: boolean; outputDir: vscode.Uri; label: string }> {
    const stat = await vscode.workspace.fs.stat(resource);
    const target = normalizeFsPath(resource.fsPath);
    const isDirectory = stat.type === vscode.FileType.Directory;
    const relative = path.relative(workspaceRoot, target);
    const label = relative && !relative.startsWith("..") ? relative : path.basename(target);

    if (isDirectory) {
      return {
        target,
        isDirectory,
        outputDir: vscode.Uri.file(path.join(target, "notes")),
        label
      };
    }

    const baseName = path.basename(target, path.extname(target)) || "file";
    return {
      target,
      isDirectory,
      outputDir: vscode.Uri.file(path.join(path.dirname(target), "notes", baseName)),
      label
    };
  }

  private isInScope(note: CodeNote, scope: { target: string; isDirectory: boolean } | undefined): boolean {
    if (!scope) {
      return true;
    }

    const filePath = normalizeFsPath(note.filePath);
    if (!scope.isDirectory) {
      return this.samePath(filePath, scope.target);
    }

    const relative = path.relative(scope.target, filePath);
    return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
  }

  private samePath(a: string, b: string): boolean {
    return process.platform === "win32" ? a.toLowerCase() === b.toLowerCase() : a === b;
  }

  private title(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }
}
