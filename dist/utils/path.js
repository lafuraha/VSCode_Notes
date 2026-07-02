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
exports.normalizeFsPath = normalizeFsPath;
exports.getWorkspaceRoot = getWorkspaceRoot;
exports.getStorageUri = getStorageUri;
exports.asWorkspaceRelative = asWorkspaceRelative;
exports.vscodeOpenUri = vscodeOpenUri;
exports.getProjectRoot = getProjectRoot;
exports.getAncestorDirectories = getAncestorDirectories;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const vscode = __importStar(require("vscode"));
function normalizeFsPath(filePath) {
    return path.normalize(filePath);
}
function getWorkspaceRoot(uri) {
    const configuredRoot = getConfiguredProjectRoot();
    if (configuredRoot) {
        return configuredRoot;
    }
    const folder = vscode.workspace.getWorkspaceFolder(uri);
    return folder?.uri.fsPath ?? path.dirname(uri.fsPath);
}
function getStorageUri() {
    const configPath = vscode.workspace.getConfiguration("codeNotes").get("storagePath", ".vscode/code-notes.json");
    const folders = vscode.workspace.workspaceFolders;
    const root = getConfiguredProjectRoot() ?? folders?.[0]?.uri.fsPath ?? process.cwd();
    if (path.isAbsolute(configPath)) {
        return vscode.Uri.file(configPath);
    }
    const existing = findExistingStorageInAncestors(root, configPath);
    return vscode.Uri.file(existing ?? path.join(root, configPath));
}
function asWorkspaceRelative(filePath, workspaceRoot) {
    return path.relative(workspaceRoot, filePath) || path.basename(filePath);
}
function vscodeOpenUri(filePath, line) {
    const normalized = filePath.replace(/\\/g, "/");
    return `vscode://file/${normalized}:${line + 1}:1`;
}
function getProjectRoot() {
    return getConfiguredProjectRoot() ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();
}
function getAncestorDirectories(startPath) {
    const start = fs.existsSync(startPath) && fs.statSync(startPath).isFile() ? path.dirname(startPath) : startPath;
    const dirs = [];
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
function getConfiguredProjectRoot() {
    const configured = vscode.workspace.getConfiguration("codeNotes").get("projectRoot", "").trim();
    if (!configured) {
        return undefined;
    }
    if (path.isAbsolute(configured)) {
        return normalizeFsPath(configured);
    }
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();
    return normalizeFsPath(path.join(workspaceRoot, configured));
}
function findExistingStorageInAncestors(startDir, configPath) {
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
//# sourceMappingURL=path.js.map