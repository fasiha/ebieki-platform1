import { For, Show, type Component } from "solid-js";
import { MemoryThumbnail } from "./MemoryThumbnail";
import { learned, type Learned } from "./signals";
interface Props {
  kanjis: string[];
  kanas: string[];
  learnedOnly: boolean;
}

export const Thumbnails: Component<Props> = ({
  kanjis,
  kanas,
  learnedOnly,
}) => {
  return (
    <div class="cards">
      <Show
        when={!learnedOnly}
        fallback={
          <For each={learnedKanjiKana(kanjis, kanas, learned())}>
            {([kanji, kana]) => <MemoryThumbnail kanji={kanji} kana={kana} />}
          </For>
        }
      >
        <For each={kanjis}>
          {(kanji, idx) => (
            <MemoryThumbnail kanji={kanji} kana={kanas[idx()]} />
          )}
        </For>
      </Show>
    </div>
  );
};

const learnedKanjiKana = (
  kanijs: string[],
  kanas: string[],
  learnedObj: Learned
): [string, string][] => {
  const res: [string, string][] = [];
  for (const [idx, kanji] of kanijs.entries()) {
    if (learnedObj[kanji] && Object.values(learnedObj[kanji]!).some((x) => x)) {
      res.push([kanji, kanas[idx]]);
    }
  }
  return res;
};
