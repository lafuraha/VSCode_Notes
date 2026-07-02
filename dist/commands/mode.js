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
exports.isAnnotationMode = isAnnotationMode;
exports.enterAnnotationMode = enterAnnotationMode;
exports.exitAnnotationMode = exitAnnotationMode;
const vscode = __importStar(require("vscode"));
const addNote_1 = require("./addNote");
const note_1 = require("../types/note");
let annotationMode = false;
let annotationType = "normal";
let controller;
function isAnnotationMode() {
    return annotationMode;
}
async function enterAnnotationMode(store, symbolService) {
    const pickedType = await vscode.window.showQuickPick(note_1.noteTypes, {
        placeHolder: "Choose the highlight type for continuous annotation mode"
    });
    if (!pickedType) {
        return;
    }
    annotationType = pickedType;
    annotationMode = true;
    await vscode.commands.executeCommand("setContext", "codeNotes.annotationMode", true);
    controller?.dispose();
    controller = new AnnotationModeController(store, symbolService, annotationType);
    void vscode.window.showInformationMessage(`Code Notes continuous annotation mode enabled: ${annotationType}.`);
}
async function exitAnnotationMode() {
    annotationMode = false;
    await vscode.commands.executeCommand("setContext", "codeNotes.annotationMode", false);
    controller?.dispose();
    controller = undefined;
    void vscode.window.showInformationMessage("Code Notes annotation mode disabled.");
}
class AnnotationModeController {
    store;
    symbolService;
    type;
    statusBar;
    disposables = [];
    timer;
    lastCreatedKey = "";
    pendingEditor;
    constructor(store, symbolService, type) {
        this.store = store;
        this.symbolService = symbolService;
        this.type = type;
        this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.statusBar.text = `Code Notes: Annotating (${type})`;
        this.statusBar.tooltip = "Selections are automatically saved as highlights. Click to exit.";
        this.statusBar.command = "codeNotes.exitAnnotationMode";
        this.statusBar.show();
        this.disposables.push(this.statusBar, vscode.window.onDidChangeTextEditorSelection((event) => this.schedule(event.textEditor)));
        if (vscode.window.activeTextEditor && !vscode.window.activeTextEditor.selection.isEmpty) {
            this.schedule(vscode.window.activeTextEditor);
        }
    }
    dispose() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = undefined;
        }
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
    }
    schedule(editor) {
        if (!annotationMode || editor.selection.isEmpty || editor.document.uri.scheme !== "file") {
            return;
        }
        this.pendingEditor = editor;
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => {
            this.timer = undefined;
            void this.createPendingHighlight();
        }, 450);
    }
    async createPendingHighlight() {
        const editor = this.pendingEditor;
        if (!annotationMode || !editor || editor.selection.isEmpty) {
            return;
        }
        const key = this.selectionKey(editor);
        if (key === this.lastCreatedKey) {
            return;
        }
        this.lastCreatedKey = key;
        await (0, addNote_1.createCodeNoteFromRange)({
            store: this.store,
            symbolService: this.symbolService,
            editor,
            type: this.type
        });
    }
    selectionKey(editor) {
        const selection = editor.selection;
        return [
            editor.document.uri.fsPath,
            selection.start.line,
            selection.start.character,
            selection.end.line,
            selection.end.character,
            this.type
        ].join(":");
    }
}
//# sourceMappingURL=mode.js.map