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
exports.CodeNotesHoverProvider = void 0;
const vscode = __importStar(require("vscode"));
const markdown_1 = require("../utils/markdown");
const range_1 = require("../utils/range");
class CodeNotesHoverProvider {
    store;
    constructor(store) {
        this.store = store;
    }
    provideHover(document, position) {
        if (!vscode.workspace.getConfiguration("codeNotes").get("hover.enable", true)) {
            return undefined;
        }
        const notes = this.store
            .getActiveVisibleByFile(document.uri.fsPath)
            .filter((note) => (0, range_1.toVsCodeRange)(note.range).contains(position));
        if (notes.length === 0) {
            return undefined;
        }
        return new vscode.Hover(notes.map(markdown_1.noteHoverMarkdown));
    }
}
exports.CodeNotesHoverProvider = CodeNotesHoverProvider;
//# sourceMappingURL=hoverProvider.js.map