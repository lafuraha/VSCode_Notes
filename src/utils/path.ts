import * as path from "path";
import * as fs from "fs";
import * as vscode from "vscode";

export function normalizeFsPath(filePath: string): string {
  return path.normalize(filePath);
}

export function getWorkspaceRoot(uri: vscode.Uri): string {
  const configuredRoot = getConfiguredProjectRoot();
  if (configuredRoot) {
    return configuredRoot;
  }

  const folder = vscode.workspace.getWorkspaceFolder(uri);
  return folder?.uri.fsPath ?? path.dirname(uri.fsPath);
}

export function getStorageUri(): vscode.Uri {
  const configPath = vscode.workspace.getConfiguration("codeNotes").get<string>("storagePath", ".vscode/code-notes.json");
  const folders = vscode.workspace.workspaceFolders;
  const root = getConfiguredProjectRoot() ?? folders?.[0]?.uri.fsPath ?? process.cwd();

  if (path.isAbsolute(configPath)) {
    return vscode.Uri.file(configPath);
  }

  const existing = findExistingStorageInAncestors(root, configPath);
  return vscode.Uri.file(existing ?? path.join(root, configPath));
}

export function asWorkspaceRelative(filePath: string, workspaceRoot: string): string {
  return path.relative(workspaceRoot, filePath) || path.basename(filePath);
}

export function vscodeOpenUri(filePath: string, line: number): string {
  const normalized = filePath.replace(/\\/g, "/");
  return `vscode://file/${normalized}:${line + 1}:1`;
}

export function getProjectRoot(): string {
  return getConfiguredProjectRoot() ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();
}

export function getAncestorDirectories(startPath: string): string[] {
  const start = fs.existsSync(startPath) && fs.statSync(startPath).isFile() ? path.dirname(startPath) : startPath;
  const dirs: string[] = [];
  let current = path.resolve(start);

  while (true) {
    dirs.push(current);
    const parent = path.dirname(current);
    if (parent === current) {
      return dirs;
    }
    current = parent;
  }
}

function getConfiguredProjectRoot(): string | undefined {
  const configured = vscode.workspace.getConfiguration("codeNotes").get<string>("projectRoot", "").trim();
  if (!configured) {
    return undefined;
  }

  if (path.isAbsolute(configured)) {
    return normalizeFsPath(configured);
  }

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();
  return normalizeFsPath(path.join(workspaceRoot, configured));
}

function findExistingStorageInAncestors(startDir: string, configPath: string): string | undefined {
  let current = path.resolve(startDir);

  while (true) {
    const candidate = path.join(current, configPath);
    if (fs.existsSync(candidate)) {
      return candidate;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return undefined;
    }
    current = parent;
  }
}
