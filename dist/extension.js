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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const addNote_1 = require("./commands/addNote");
const deleteHighlight_1 = require("./commands/deleteHighlight");
const mode_1 = require("./commands/mode");
const selectProjectRoot_1 = require("./commands/selectProjectRoot");
const hoverProvider_1 = require("./providers/hoverProvider");
const decorationService_1 = require("./services/decorationService");
const exportService_1 = require("./services/exportService");
const migrationService_1 = require("./services/migrationService");
const noteStore_1 = require("./services/noteStore");
const searchService_1 = require("./services/searchService");
const symbolService_1 = require("./services/symbolService");
async function activate(context) {
    const store = new noteStore_1.NoteStore();
    await store.load();
    const symbolService = new symbolService_1.SymbolService();
    const decorationService = new decorationService_1.DecorationService(store);
    const searchService = new searchService_1.SearchService(store);
    const exportService = new exportService_1.ExportService(store);
    const migrationService = new migrationService_1.MigrationService(store);
    context.subscriptions.push(store, decorationService, migrationService, vscode.languages.registerHoverProvider({ scheme: "file" }, new hoverProvider_1.CodeNotesHoverProvider(store)), vscode.commands.registerCommand("codeNotes.addNote", () => (0, addNote_1.addNoteCommand)(store, symbolService, true)), vscode.commands.registerCommand("codeNotes.addHighlight", () => (0, addNote_1.addNoteCommand)(store, symbolService, false)), vscode.commands.registerCommand("codeNotes.deleteHighlight", () => (0, deleteHighlight_1.deleteHighlightCommand)(store)), vscode.commands.registerCommand("codeNotes.searchNotes", () => searchService.searchAndOpen()), vscode.commands.registerCommand("codeNotes.exportNotes", () => exportService.exportByType()), vscode.commands.registerCommand("codeNotes.exportNotesForResource", (resource) => exportService.exportByType(resource)), vscode.commands.registerCommand("codeNotes.selectProjectRoot", (resource) => (0, selectProjectRoot_1.selectProjectRootCommand)(store, decorationService, resource)), vscode.commands.registerCommand("codeNotes.openNote", (id) => searchService.openNote(id)), vscode.commands.registerCommand("codeNotes.migrateNotes", () => {
        const editor = vscode.window.activeTextEditor;
        return editor ? migrationService.migrateSelectedStaleNote(editor) : undefined;
    }), vscode.commands.registerCommand("codeNotes.enterAnnotationMode", () => (0, mode_1.enterAnnotationMode)(store, symbolService)), vscode.commands.registerCommand("codeNotes.exitAnnotationMode", mode_1.exitAnnotationMode), { dispose: () => void store.flush() });
    decorationService.refreshVisibleEditors();
}
function deactivate() { }
//# sourceMappingURL=extension.js.map