import {
  createEffect,
  createSignal,
  For,
  Show,
  type Component,
} from "solid-js";
import {
  learnedHelper,
  type LearnedResponse,
} from "../pages/api/learnedHelper";
import { user } from "./signals";
import { learnHelper } from "../pages/api/learnHelper";
import { initModel } from "../ebisu/split3";
import {
  ALLOWED_DIRECTIONS,
  isDirection,
  type Direction,
} from "../interfaces/flashcardDirection";
import { unlearnHelper } from "../pages/api/unlearnHelper";

interface Props {
  vocabKanji: string;
}

type Learned = Record<string, undefined | Record<string, boolean>>;
const [learned, setLearned] = createSignal<Learned>({});
const [networkError, setNetworkError] = createSignal("");

async function fetchLearned() {
  if (!user()) return;

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

const fetchHelper = async (responsePromise: Promise<Response>) => {
  const res = await responsePromise;
  if (!res.ok) {
    setNetworkError(`Unable to learn: ${res.status} ${res.statusText}`);
    return;
  }
  fetchLearned();
  setNetworkError("");
};

export const MemoryBar: Component<Props> = ({ vocabKanji }) => {
  createEffect(() => {
    if (user()) fetchLearned();
  });

  const handleLearn = (direction: Direction) => {
    fetchHelper(
      learnHelper({
        user: user(),
        vocabKanji,
        direction,
        model: initModel(),
        modelTimeMillis: Date.now(),
      })
    );
  };
  const handleUnlearn = (direction: string) => {
    fetchHelper(
      unlearnHelper({
        user: user(),
        vocabKanji,
        direction,
      })
    );
  };

  return (
    <div>
      <Show when={networkError()}>
        <div class="network-error">{networkError()}</div>
      </Show>

      <For each={Object.entries(learned()[vocabKanji] ?? nothingLearned)}>
        {([direction, learned]) => (
          <Show
            when={learned}
            fallback={
              isDirection(direction) && (
                <button onClick={() => handleLearn(direction)}>
                  Learn {direction}
                </button>
              )
            }
          >
            {direction} ✅{" "}
            <button onClick={() => handleUnlearn(direction)}>
              Unlearn {direction}
            </button>
          </Show>
        )}
      </For>
    </div>
  );
};

const nothingLearned = Object.fromEntries(
  ALLOWED_DIRECTIONS.map((d) => [d, false])
);
