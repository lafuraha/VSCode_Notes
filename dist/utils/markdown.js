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
exports.noteHoverMarkdown = noteHoverMarkdown;
exports.exportNoteMarkdown = exportNoteMarkdown;
const vscode = __importStar(require("vscode"));
const range_1 = require("./range");
const path_1 = require("./path");
function noteHoverMarkdown(note) {
    const md = new vscode.MarkdownString(undefined, true);
    md.isTrusted = true;
    md.supportHtml = false;
    const symbol = note.symbol?.name ?? "unknown";
    md.appendMarkdown(`**${note.type.toUpperCase()}** · \`${symbol}\` · ${(0, range_1.lineLabel)(note.range)}\n\n`);
    if (note.status === "stale") {
        md.appendMarkdown("> Stale: source text changed or highlight was removed. Run manual migration to restore a range.\n\n");
    }
    md.appendMarkdown(note.note?.trim() ? note.note.trim() : "_Highlight only._");
    md.appendMarkdown(`\n\n[Open](command:codeNotes.openNote?${encodeURIComponent(JSON.stringify([note.id]))})`);
    return md;
}
function exportNoteMarkdown(note, workspaceRoot, codeBlock, languageId) {
    const relative = (0, path_1.asWorkspaceRelative)(note.filePath, workspaceRoot).replace(/\\/g, "/");
    const symbol = note.symbol?.name ?? "unknown";
    const open = (0, path_1.vscodeOpenUri)(note.filePath, note.range.startLine);
    const noteText = note.note?.trim() ? note.note.trim() : "_Highlight only._";
    return [
        `## ${relative}`,
        "",
        // `- \`${symbol}\` · ${lineLabel(note.range)} · [open](${open})`,
        `- ${(0, range_1.lineLabel)(note.range)} · [open](${open})`,
        "",
        noteText,
        "",
        `\`\`\`${languageId}`,
        codeBlock,
        "```",
        ""
    ].join("\n");
}
//# sourceMappingURL=markdown.js.map