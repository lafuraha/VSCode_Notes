export type NoteType = "normal" | "todo" | "important" | "bug";

export type NoteStatus = "active" | "stale";

export interface CodeNoteRange {
  startLine: number;
  startChar: number;
  endLine: number;
  endChar: number;
}

export interface CodeNoteSymbol {
  name: string;
  kind: "class" | "function" | "method" | "unknown";
}

export interface CodeNote {
  id: string;
  filePath: string;
  workspaceRoot: string;
  range: CodeNoteRange;
  symbol?: CodeNoteSymbol;
  type: NoteType;
  note?: string;
  originalTextHash: string;
  status: NoteStatus;
  highlightVisible: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CodeNotesFile {
  version: 1;
  updatedAt: number;
  notes: CodeNote[];
}

export const noteTypes: NoteType[] = ["normal", "todo", "important", "bug"];
