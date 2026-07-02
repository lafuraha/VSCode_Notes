"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectProjectRootCommand = selectProjectRootCommand;
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const path_1 = require("../utils/path");
async function selectProjectRootCommand(store, decorationService, resource) {
    const start = resource?.fsPath ?? vscode.window.activeTextEditor?.document.uri.fsPath ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!start) {
        void vscode.window.showWarningMessage("Open a workspace or file before selecting a Code Notes project root.");
        return;
    }
    const candidates = (0, path_1.getAncestorDirectories)(start);
    const current = vscode.workspace.getConfiguration("codeNotes").get("projectRoot", "");
    const picked = await vscode.window.showQuickPick(candidates.map((dir) => ({
        label: path.basename(dir) || dir,
        description: dir === current ? "current" : dir,
        detail: dir,
        dir
    })), {
        placeHolder: "Choose which directory should be treated as the Code Notes project root"
    });
    if (!picked) {
        return;
    }
    await vscode.workspace.getConfiguration("codeNotes").update("projectRoot", picked.dir, vscode.ConfigurationTarget.Workspace);
    await store.load();
    decorationService.refreshVisibleEditors();
    void vscode.window.showInformationMessage(`Code Notes project root set to ${picked.dir}`);
}
//# sourceMappingURL=selectProjectRoot.js.map