import { createMemo, type Component } from "solid-js";
import { learned, user, type Learned } from "./signals";
interface Props {
  kanji: string;
  kana: string;
}

export const MemoryThumbnail: Component<Props> = ({ kanji, kana }) => {
  const isLearned = createMemo(() =>
    user() ? vocabLearned(learned(), kanji) : false
  );
  return (
    <a
      href={`/vocab/${kanji}`}
      classList={{ card: true, "card-learned": isLearned() }}
    >
      <ruby>
        {kanji}
        <rt>{kana}</rt>
      </ruby>{" "}
    </a>
  );
};

const vocabLearned = (learned: Learned, vocabKanji: string): boolean => {
  const learnt = learned[vocabKanji];
  for (const key in learnt) {
    if (learnt[key]) {
      return true;
    }
  }
  return false;
};
