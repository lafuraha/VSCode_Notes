import { createHash, randomUUID } from "crypto";

export function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

export function createId(): string {
  return randomUUID();
}
