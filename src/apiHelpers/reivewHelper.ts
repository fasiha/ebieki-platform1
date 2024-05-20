import type { WithDistance } from "ebieki";

export interface KanaReview {
  direction: "kana";
  similarMeaning: WithDistance[];
  similarKanaKnown: WithDistance[];
  similarKanaUnknown: WithDistance[];
  target: WithDistance;
}

export interface KanjiReview {
  direction: "kanji";
  target: WithDistance;
}
