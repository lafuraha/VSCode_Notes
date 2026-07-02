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
exports.deleteHighlightCommand = deleteHighlightCommand;
const vscode = __importStar(require("vscode"));
const range_1 = require("../utils/range");
async function deleteHighlightCommand(store) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    const range = (0, range_1.normalizeSelection)(editor.selection);
    if (!range) {
        void vscode.window.showWarningMessage("Select a highlighted range to remove its highlight.");
        return;
    }
    const matches = store
        .getActiveVisibleByFile(editor.document.uri.fsPath)
        .filter((note) => (0, range_1.intersects)(note.range, range));
    if (matches.length === 0) {
        void vscode.window.showInformationMessage("No active highlights intersect the selection.");
        return;
    }
    await store.updateMany(matches.map((note) => ({ ...note, highlightVisible: false, status: "stale" })));
}
//# sourceMappingURL=deleteHighlight.js.map