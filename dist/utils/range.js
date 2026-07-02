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
exports.toVsCodeRange = toVsCodeRange;
exports.fromVsCodeRange = fromVsCodeRange;
exports.normalizeSelection = normalizeSelection;
exports.intersects = intersects;
exports.lineLabel = lineLabel;
const vscode = __importStar(require("vscode"));
function toVsCodeRange(range) {
    return new vscode.Range(new vscode.Position(range.startLine, range.startChar), new vscode.Position(range.endLine, range.endChar));
}
function fromVsCodeRange(range) {
    return {
        startLine: range.start.line,
        startChar: range.start.character,
        endLine: range.end.line,
        endChar: range.end.character
    };
}
function normalizeSelection(selection) {
    if (selection.isEmpty) {
        return undefined;
    }
    return new vscode.Range(selection.start, selection.end);
}
function intersects(a, b) {
    return toVsCodeRange(a).intersection(b) !== undefined;
}
function lineLabel(range) {
    const start = range.startLine + 1;
    const end = range.endLine + 1;
    return start === end ? `Line ${start}` : `Lines ${start}-${end}`;
}
//# sourceMappingURL=range.js.map