export type LearnedResponse = {
  buried: number;
  direction: string;
  vocabKanji: string;
  createdMillis: number;
}[];

export const learnedHelper = (user: string) =>
  fetch("/api/learned?user=" + user);
