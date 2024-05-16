import type { Direction } from "../interfaces/flashcardDirection";

export interface Args {
  user: string;
  vocabKanji: string;
  direction: Direction;
  model: unknown;
  modelTimeMillis: number;
  quizMeta?: unknown;
}
export const learnHelper = async (args: Args) =>
  fetch("/api/learn", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
