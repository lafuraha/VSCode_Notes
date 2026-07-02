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
exports.addNoteCommand = addNoteCommand;
exports.createCodeNoteFromRange = createCodeNoteFromRange;
const vscode = __importStar(require("vscode"));
const note_1 = require("../types/note");
const hash_1 = require("../utils/hash");
const range_1 = require("../utils/range");
const path_1 = require("../utils/path");
async function addNoteCommand(store, symbolService, withMarkdown) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    const range = (0, range_1.normalizeSelection)(editor.selection);
    if (!range) {
        void vscode.window.showWarningMessage("Select code before adding a Code Note.");
        return;
    }
    const pickedType = await vscode.window.showQuickPick(note_1.noteTypes, { placeHolder: "Choose note type" });
    if (!pickedType) {
        return;
    }
    const markdown = withMarkdown
        ? await vscode.window.showInputBox({
            prompt: "Markdown note",
            placeHolder: "Why is this code important?"
        })
        : undefined;
    if (withMarkdown && markdown === undefined) {
        return;
    }
    await createCodeNoteFromRange({
        store,
        symbolService,
        editor,
        type: pickedType,
        note: markdown
    });
}
async function createCodeNoteFromRange(options) {
    const range = (0, range_1.normalizeSelection)(options.editor.selection);
    if (!range) {
        return undefined;
    }
    const document = options.editor.document;
    const now = Date.now();
    const note = {
        id: (0, hash_1.createId)(),
        filePath: (0, path_1.normalizeFsPath)(document.uri.fsPath),
        workspaceRoot: (0, path_1.getWorkspaceRoot)(document.uri),
        range: (0, range_1.fromVsCodeRange)(range),
        symbol: await options.symbolService.findNearestSymbol(document, range),
        type: options.type,
        note: options.note,
        originalTextHash: (0, hash_1.sha256)(document.getText(range)),
        status: "active",
        highlightVisible: true,
        createdAt: now,
        updatedAt: now
    };
    await options.store.add(note);
    return note;
}
//# sourceMappingURL=addNote.js.map