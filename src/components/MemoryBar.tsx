import { For, Show, type Component } from "solid-js";
import {
  fetchLearned,
  learned,
  networkError,
  setNetworkError,
  user,
} from "./signals";
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

const fetchHelper = async (responsePromise: Promise<Response>) => {
  const res = await responsePromise;
  if (!res.ok) {
    setNetworkError(`Unable to learn: ${res.status} ${res.statusText}`);
    return;
  }
  fetchLearned();
};

export const MemoryBar: Component<Props> = ({ vocabKanji }) => {
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
