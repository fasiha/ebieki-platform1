import { For, type Component } from "solid-js";
import type { WithDistance } from "../interfaces/ebi-eki";
import { learned } from "./signals";
import { MemoryThumbnail } from "./MemoryThumbnail";
interface Props {
  // ebieki: WithDistance[];
  kanjis: string[];
  kanas: string[];
}

export const Thumbnails: Component<Props> = ({ kanjis, kanas }) => {
  return (
    <div class="cards">
      <For each={kanjis}>
        {(kanji, idx) => <MemoryThumbnail kanji={kanji} kana={kanas[idx()]} />}
      </For>
    </div>
  );
};
