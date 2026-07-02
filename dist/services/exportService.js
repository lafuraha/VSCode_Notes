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
exports.ExportService = void 0;
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const note_1 = require("../types/note");
const markdown_1 = require("../utils/markdown");
const path_1 = require("../utils/path");
class ExportService {
    store;
    constructor(store) {
        this.store = store;
    }
    async exportByType(resource) {
        const folders = vscode.workspace.workspaceFolders;
        if (!folders?.length) {
            void vscode.window.showWarningMessage("Open a workspace before exporting Code Notes.");
            return;
        }
        const root = (0, path_1.getProjectRoot)();
        const scope = resource ? await this.resolveScope(resource, root) : undefined;
        const outputDir = scope ? scope.outputDir : vscode.Uri.file(path.join(root, "notes"));
        await vscode.workspace.fs.createDirectory(outputDir);
        const headLines = vscode.workspace.getConfiguration("codeNotes.export").get("headLines", 3);
        const tailLines = vscode.workspace.getConfiguration("codeNotes.export").get("tailLines", 3);
        for (const type of note_1.noteTypes) {
            const notes = this.store.getByType(type).filter((note) => this.isInScope(note, scope));
            const chunks = [`# ${this.title(type)} Notes`, "", "---", ""];
            for (const note of notes) {
                const document = await vscode.workspace.openTextDocument(vscode.Uri.file(note.filePath));
                const startLine = Math.max(0, note.range.startLine - headLines);
                const endLine = Math.min(document.lineCount - 1, note.range.endLine + tailLines);
                const codeRange = new vscode.Range(new vscode.Position(startLine, 0), document.lineAt(endLine).range.end);
                const codeBlock = document.getText(codeRange);
                const languageId = document.languageId === "plaintext" ? "" : document.languageId;
                chunks.push((0, markdown_1.exportNoteMarkdown)(note, note.workspaceRoot, codeBlock, languageId));
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
    async resolveScope(resource, workspaceRoot) {
        const stat = await vscode.workspace.fs.stat(resource);
        const target = (0, path_1.normalizeFsPath)(resource.fsPath);
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
    isInScope(note, scope) {
        if (!scope) {
            return true;
        }
        const filePath = (0, path_1.normalizeFsPath)(note.filePath);
        if (!scope.isDirectory) {
            return this.samePath(filePath, scope.target);
        }
        const relative = path.relative(scope.target, filePath);
        return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
    }
    samePath(a, b) {
        return process.platform === "win32" ? a.toLowerCase() === b.toLowerCase() : a === b;
    }
    title(type) {
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
}
exports.ExportService = ExportService;
//# sourceMappingURL=exportService.js.map