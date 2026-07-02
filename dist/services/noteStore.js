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
exports.NoteStore = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const note_1 = require("../types/note");
const path_1 = require("../utils/path");
class NoteStore {
    changedEmitter = new vscode.EventEmitter();
    notes = new Map();
    byFile = new Map();
    byType = new Map();
    saveTimer;
    storageUri = (0, path_1.getStorageUri)();
    onDidChange = this.changedEmitter.event;
    async load() {
        this.storageUri = (0, path_1.getStorageUri)();
        this.notes.clear();
        this.byFile.clear();
        this.byType.clear();
        try {
            const data = await vscode.workspace.fs.readFile(this.storageUri);
            const parsed = JSON.parse(Buffer.from(data).toString("utf8"));
            for (const note of parsed.notes ?? []) {
                this.insertIndexes({ ...note, filePath: (0, path_1.normalizeFsPath)(note.filePath), highlightVisible: note.highlightVisible ?? true });
            }
        }
        catch (error) {
            if (error.code !== "FileNotFound") {
                console.warn("Code Notes: failed to load store", error);
            }
        }
    }
    all() {
        return [...this.notes.values()].sort((a, b) => a.createdAt - b.createdAt);
    }
    get(id) {
        return this.notes.get(id);
    }
    getByFile(filePath) {
        const key = (0, path_1.normalizeFsPath)(filePath);
        return this.idsToNotes(this.byFile.get(key));
    }
    getByType(type) {
        return this.idsToNotes(this.byType.get(type));
    }
    getActiveVisibleByFile(filePath) {
        return this.getByFile(filePath).filter((note) => note.status === "active" && note.highlightVisible);
    }
    async add(note) {
        this.insertIndexes({ ...note, filePath: (0, path_1.normalizeFsPath)(note.filePath) });
        this.scheduleSave();
        this.changedEmitter.fire();
    }
    async update(note) {
        const old = this.notes.get(note.id);
        if (old) {
            this.removeIndexes(old);
        }
        this.insertIndexes({ ...note, filePath: (0, path_1.normalizeFsPath)(note.filePath), updatedAt: Date.now() });
        this.scheduleSave();
        this.changedEmitter.fire();
    }
    async updateMany(notes) {
        for (const note of notes) {
            const old = this.notes.get(note.id);
            if (old) {
                this.removeIndexes(old);
            }
            this.insertIndexes({ ...note, filePath: (0, path_1.normalizeFsPath)(note.filePath), updatedAt: Date.now() });
        }
        this.scheduleSave();
        this.changedEmitter.fire();
    }
    async flush() {
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
            this.saveTimer = undefined;
        }
        await this.save();
    }
    dispose() {
        this.changedEmitter.dispose();
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
        }
    }
    insertIndexes(note) {
        this.notes.set(note.id, note);
        this.addToIndex(this.byFile, note.filePath, note.id);
        this.addToIndex(this.byType, note.type, note.id);
    }
    removeIndexes(note) {
        this.notes.delete(note.id);
        this.byFile.get(note.filePath)?.delete(note.id);
        this.byType.get(note.type)?.delete(note.id);
    }
    addToIndex(index, key, id) {
        let set = index.get(key);
        if (!set) {
            set = new Set();
            index.set(key, set);
        }
        set.add(id);
    }
    idsToNotes(ids) {
        if (!ids) {
            return [];
        }
        return [...ids].map((id) => this.notes.get(id)).filter((note) => Boolean(note));
    }
    scheduleSave() {
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
        }
        this.saveTimer = setTimeout(() => {
            void this.save();
        }, 250);
    }
    async save() {
        this.saveTimer = undefined;
        const folder = vscode.Uri.file(path.dirname(this.storageUri.fsPath));
        await vscode.workspace.fs.createDirectory(folder);
        const payload = {
            version: 1,
            updatedAt: Date.now(),
            notes: this.all()
        };
        const tmp = vscode.Uri.file(`${this.storageUri.fsPath}.tmp`);
        await vscode.workspace.fs.writeFile(tmp, Buffer.from(`${JSON.stringify(payload, null, 2)}\n`, "utf8"));
        await vscode.workspace.fs.rename(tmp, this.storageUri, { overwrite: true });
        for (const type of note_1.noteTypes) {
            this.byType.set(type, this.byType.get(type) ?? new Set());
        }
    }
}
exports.NoteStore = NoteStore;
//# sourceMappingURL=noteStore.js.map