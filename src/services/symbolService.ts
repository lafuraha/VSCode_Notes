import * as vscode from "vscode";
import { CodeNoteSymbol } from "../types/note";

export class SymbolService {
  async findNearestSymbol(document: vscode.TextDocument, range: vscode.Range): Promise<CodeNoteSymbol> {
    if (!vscode.workspace.getConfiguration("codeNotes").get<boolean>("symbol.enable", true)) {
      return { name: "unknown", kind: "unknown" };
    }

    try {
      const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
        "vscode.executeDocumentSymbolProvider",
        document.uri
      );
      const flattened = this.flatten(symbols ?? []);
      const containing = flattened
        .filter((symbol) => symbol.range.contains(range.start))
        .sort((a, b) => this.rangeSize(a.range) - this.rangeSize(b.range))[0];

      if (!containing) {
        return { name: "unknown", kind: "unknown" };
      }

      return {
        name: containing.name,
        kind: this.kindToNoteKind(containing.kind)
      };
    } catch {
      return { name: "unknown", kind: "unknown" };
    }
  }

  private flatten(symbols: vscode.DocumentSymbol[]): vscode.DocumentSymbol[] {
    return symbols.flatMap((symbol) => [symbol, ...this.flatten(symbol.children)]);
  }

  private rangeSize(range: vscode.Range): number {
    return (range.end.line - range.start.line) * 10000 + range.end.character - range.start.character;
  }

  private kindToNoteKind(kind: vscode.SymbolKind): CodeNoteSymbol["kind"] {
    switch (kind) {
      case vscode.SymbolKind.Class:
        return "class";
      case vscode.SymbolKind.Function:
        return "function";
      case vscode.SymbolKind.Method:
        return "method";
      default:
        return "unknown";
    }
  }
}
