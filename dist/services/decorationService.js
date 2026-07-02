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
exports.DecorationService = void 0;
const vscode = __importStar(require("vscode"));
const note_1 = require("../types/note");
const range_1 = require("../utils/range");
const markdown_1 = require("../utils/markdown");
class DecorationService {
    store;
    highlightDecorationTypes = new Map();
    noteDecorationTypes = new Map();
    disposables = [];
    constructor(store) {
        this.store = store;
        this.rebuildDecorationTypes();
        this.disposables.push(this.store.onDidChange(() => this.refreshVisibleEditors()), vscode.window.onDidChangeVisibleTextEditors(() => this.refreshVisibleEditors()), vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration("codeNotes.colors")) {
                this.rebuildDecorationTypes();
                this.refreshVisibleEditors();
            }
        }));
    }
    refreshVisibleEditors() {
        for (const editor of vscode.window.visibleTextEditors) {
            this.refreshEditor(editor);
        }
    }
    refreshEditor(editor) {
        const notes = this.store.getActiveVisibleByFile(editor.document.uri.fsPath);
        const hoverEnabled = vscode.workspace.getConfiguration("codeNotes").get("hover.enable", true);
        for (const type of note_1.noteTypes) {
            const typedNotes = notes.filter((note) => note.type === type);
            const highlightOnlyOptions = typedNotes
                .filter((note) => !this.hasMarkdownNote(note.note))
                .map((note) => ({
                range: (0, range_1.toVsCodeRange)(note.range),
                hoverMessage: hoverEnabled ? (0, markdown_1.noteHoverMarkdown)(note) : undefined
            }));
            const noteOptions = typedNotes
                .filter((note) => this.hasMarkdownNote(note.note))
                .map((note) => ({
                range: (0, range_1.toVsCodeRange)(note.range),
                hoverMessage: hoverEnabled ? (0, markdown_1.noteHoverMarkdown)(note) : undefined
            }));
            editor.setDecorations(this.highlightDecorationTypes.get(type), highlightOnlyOptions);
            editor.setDecorations(this.noteDecorationTypes.get(type), noteOptions);
        }
    }
    dispose() {
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
        for (const type of this.highlightDecorationTypes.values()) {
            type.dispose();
        }
        for (const type of this.noteDecorationTypes.values()) {
            type.dispose();
        }
    }
    rebuildDecorationTypes() {
        for (const type of this.highlightDecorationTypes.values()) {
            type.dispose();
        }
        for (const type of this.noteDecorationTypes.values()) {
            type.dispose();
        }
        this.highlightDecorationTypes.clear();
        this.noteDecorationTypes.clear();
        const config = vscode.workspace.getConfiguration("codeNotes.colors");
        const icon = this.gutterIconDataUri();
        for (const type of note_1.noteTypes) {
            const color = config.get(type, this.defaultColor(type));
            this.highlightDecorationTypes.set(type, vscode.window.createTextEditorDecorationType({
                backgroundColor: color,
                isWholeLine: false,
                overviewRulerColor: color,
                overviewRulerLane: vscode.OverviewRulerLane.Right
            }));
            this.noteDecorationTypes.set(type, vscode.window.createTextEditorDecorationType({
                backgroundColor: color,
                isWholeLine: false,
                overviewRulerColor: color,
                overviewRulerLane: vscode.OverviewRulerLane.Right,
                gutterIconPath: icon,
                gutterIconSize: "contain"
            }));
        }
    }
    hasMarkdownNote(note) {
        return Boolean(note?.trim());
    }
    defaultColor(type) {
        switch (type) {
            case "todo":
                return "rgba(255, 193, 7, 0.35)";
            case "important":
                return "rgba(129, 212, 250, 0.35)";
            case "bug":
                return "rgba(244, 67, 54, 0.25)";
            default:
                return "rgba(255, 235, 59, 0.35)";
        }
    }
    gutterIconDataUri() {
        const svg = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14"><path fill="#f5c542" d="M3 1.5h8v11L7 10 3 12.5z"/></svg>`);
        return vscode.Uri.parse(`data:image/svg+xml,${svg}`);
    }
}
exports.DecorationService = DecorationService;
//# sourceMappingURL=decorationService.js.map