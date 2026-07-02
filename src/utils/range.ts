import * as vscode from "vscode";
import { CodeNoteRange } from "../types/note";

export function toVsCodeRange(range: CodeNoteRange): vscode.Range {
  return new vscode.Range(
    new vscode.Position(range.startLine, range.startChar),
    new vscode.Position(range.endLine, range.endChar)
  );
}

export function fromVsCodeRange(range: vscode.Range): CodeNoteRange {
  return {
    startLine: range.start.line,
    startChar: range.start.character,
    endLine: range.end.line,
    endChar: range.end.character
  };
}

export function normalizeSelection(selection: vscode.Selection): vscode.Range | undefined {
  if (selection.isEmpty) {
    return undefined;
  }

  return new vscode.Range(selection.start, selection.end);
}

export function intersects(a: CodeNoteRange, b: vscode.Range): boolean {
  return toVsCodeRange(a).intersection(b) !== undefined;
}

export function lineLabel(range: CodeNoteRange): string {
  const start = range.startLine + 1;
  const end = range.endLine + 1;
  return start === end ? `Line ${start}` : `Lines ${start}-${end}`;
}
