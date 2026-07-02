import * as path from "path";
import * as vscode from "vscode";
import { DecorationService } from "../services/decorationService";
import { NoteStore } from "../services/noteStore";
import { getAncestorDirectories } from "../utils/path";

export async function selectProjectRootCommand(
  store: NoteStore,
  decorationService: DecorationService,
  resource?: vscode.Uri
): Promise<void> {
  const start = resource?.fsPath ?? vscode.window.activeTextEditor?.document.uri.fsPath ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!start) {
    void vscode.window.showWarningMessage("Open a workspace or file before selecting a Code Notes project root.");
    return;
  }

  const candidates = getAncestorDirectories(start);
  const current = vscode.workspace.getConfiguration("codeNotes").get<string>("projectRoot", "");
  const picked = await vscode.window.showQuickPick(
    candidates.map((dir) => ({
      label: path.basename(dir) || dir,
      description: dir === current ? "current" : dir,
      detail: dir,
      dir
    })),
    {
      placeHolder: "Choose which directory should be treated as the Code Notes project root"
    }
  );

  if (!picked) {
    return;
  }

  await vscode.workspace.getConfiguration("codeNotes").update("projectRoot", picked.dir, vscode.ConfigurationTarget.Workspace);
  await store.load();
  decorationService.refreshVisibleEditors();
  void vscode.window.showInformationMessage(`Code Notes project root set to ${picked.dir}`);
}
