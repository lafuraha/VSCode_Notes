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
exports.SearchService = void 0;
const vscode = __importStar(require("vscode"));
const range_1 = require("../utils/range");
const path_1 = require("../utils/path");
class SearchService {
    store;
    constructor(store) {
        this.store = store;
    }
    async searchAndOpen() {
        const items = this.store.all().map((note) => ({
            label: `${note.type}: ${note.note?.split(/\r?\n/)[0] || "Highlight only"}`,
            description: `${note.status} · ${(0, range_1.lineLabel)(note.range)}`,
            detail: `${(0, path_1.asWorkspaceRelative)(note.filePath, note.workspaceRoot)} · ${note.symbol?.name ?? "unknown"}`,
            note
        }));
        const picked = await vscode.window.showQuickPick(items, {
            matchOnDescription: true,
            matchOnDetail: true,
            placeHolder: "Search notes by text, file, symbol, type, or status"
        });
        if (picked) {
            await this.openNote(picked.note.id);
        }
    }
    async openNote(id) {
        const note = this.store.get(id);
        if (!note) {
            void vscode.window.showWarningMessage("Code note not found.");
            return;
        }
        const document = await vscode.workspace.openTextDocument(vscode.Uri.file(note.filePath));
        const editor = await vscode.window.showTextDocument(document, { preview: false });
        const range = (0, range_1.toVsCodeRange)(note.range);
        editor.selection = new vscode.Selection(range.start, range.end);
        editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
    }
}
exports.SearchService = SearchService;
//# sourceMappingURL=searchService.js.map