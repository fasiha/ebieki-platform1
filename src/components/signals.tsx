import { createEffect, createSignal, type Setter } from "solid-js";
import {
  learnedHelper,
  type LearnedResponse,
} from "../pages/api/learnedHelper";
import { ALLOWED_DIRECTIONS } from "../interfaces/flashcardDirection";

export const [user, setUser] = createSignal("");
export const [networkError, setNetworkError] = createSignal("");

export type Learned = Record<string, undefined | Record<string, boolean>>;
export const [learned, setLearned] = createSignal<Learned>({});

createEffect(() => {
  fetchLearned();
});

export async function fetchLearned() {
  if (!user()) {
    setLearned({});
    return;
  }
  console.log("fetching learned");

  const res = await learnedHelper(user());
  if (!res.ok) {
    setNetworkError(`Couldn't get learned: ${res.status} ${res.statusText}`);
    return;
  }
  const json: LearnedResponse = await res.json();
  const map: Learned = {};
  for (const card of json) {
    if (!(card.vocabKanji in map))
      map[card.vocabKanji] = Object.fromEntries(
        ALLOWED_DIRECTIONS.map((dir) => [dir, false])
      );
    if (!card.buried) map[card.vocabKanji]![card.direction] = true;
  }
  setLearned(map);
  setNetworkError("");
}
