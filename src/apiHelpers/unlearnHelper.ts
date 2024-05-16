import type { Direction } from "../interfaces/flashcardDirection";

export interface Args {
  user: string;
  vocabKanji: string;
  direction: Direction | string; // we'll allow you to unlearn something TypeScript doesn't know about
}

export const unlearnHelper = async (args: Args) =>
  fetch("/api/unlearn", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
