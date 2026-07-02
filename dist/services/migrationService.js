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
exports.MigrationService = void 0;
const vscode = __importStar(require("vscode"));
const hash_1 = require("../utils/hash");
const range_1 = require("../utils/range");
class MigrationService {
    store;
    disposables = [];
    timers = new Map();
    constructor(store) {
        this.store = store;
        this.disposables.push(vscode.workspace.onDidChangeTextDocument((event) => this.scheduleStaleCheck(event.document)), vscode.workspace.onDidOpenTextDocument((document) => this.scheduleStaleCheck(document)));
    }
    async markChangedRangesStale(document) {
        const updates = this.store
            .getActiveVisibleByFile(document.uri.fsPath)
            .filter((note) => {
            try {
                const text = document.getText((0, range_1.toVsCodeRange)(note.range));
                return (0, hash_1.sha256)(text) !== note.originalTextHash;
            }
            catch {
                return true;
            }
        })
            .map((note) => ({
            ...note,
            status: "stale",
            highlightVisible: false
        }));
        if (updates.length > 0) {
            await this.store.updateMany(updates);
        }
    }
    async migrateSelectedStaleNote(editor) {
        const range = (0, range_1.normalizeSelection)(editor.selection);
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
        const picked = await vscode.window.showQuickPick(staleNotes.map((note) => ({
            label: note.note?.split(/\r?\n/)[0] || `${note.type} note`,
            description: note.symbol?.name ?? "unknown",
            detail: note.id,
            note
        })), { placeHolder: "Choose the stale note to attach to the current selection" });
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
            originalTextHash: (0, hash_1.sha256)(editor.document.getText(range)),
            status: "active",
            highlightVisible: true
        });
    }
    dispose() {
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
        for (const timer of this.timers.values()) {
            clearTimeout(timer);
        }
    }
    scheduleStaleCheck(document) {
        const key = document.uri.toString();
        const existing = this.timers.get(key);
        if (existing) {
            clearTimeout(existing);
        }
        this.timers.set(key, setTimeout(() => {
            this.timers.delete(key);
            void this.markChangedRangesStale(document);
        }, 300));
    }
}
exports.MigrationService = MigrationService;
//# sourceMappingURL=migrationService.js.map