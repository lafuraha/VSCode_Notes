import * as vscode from "vscode";
import { CodeNote } from "../types/note";
import { lineLabel } from "./range";
import { asWorkspaceRelative, vscodeOpenUri } from "./path";

export function noteHoverMarkdown(note: CodeNote): vscode.MarkdownString {
  const md = new vscode.MarkdownString(undefined, true);
  md.isTrusted = true;
  md.supportHtml = false;

  const symbol = note.symbol?.name ?? "unknown";
  md.appendMarkdown(`**${note.type.toUpperCase()}** · \`${symbol}\` · ${lineLabel(note.range)}\n\n`);
  if (note.status === "stale") {
    md.appendMarkdown("> Stale: source text changed or highlight was removed. Run manual migration to restore a range.\n\n");
  }
  md.appendMarkdown(note.note?.trim() ? note.note.trim() : "_Highlight only._");
  md.appendMarkdown(`\n\n[Open](command:codeNotes.openNote?${encodeURIComponent(JSON.stringify([note.id]))})`);
  return md;
}

export function exportNoteMarkdown(note: CodeNote, workspaceRoot: string, codeBlock: string, languageId: string): string {
  const relative = asWorkspaceRelative(note.filePath, workspaceRoot).replace(/\\/g, "/");
  const symbol = note.symbol?.name ?? "unknown";
  const open = vscodeOpenUri(note.filePath, note.range.startLine);
  const noteText = note.note?.trim() ? note.note.trim() : "_Highlight only._";

  return [
    `## ${relative}`,
    "",
    // `- \`${symbol}\` · ${lineLabel(note.range)} · [open](${open})`,
    `- ${lineLabel(note.range)} · [open](${open})`,
    "",
    noteText,
    "",
    `\`\`\`${languageId}`,
    codeBlock,
    "```",
    ""
  ].join("\n");
}
