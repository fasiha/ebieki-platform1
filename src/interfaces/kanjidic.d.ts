export interface SimpleCharacter {
  nanori: string[];
  readings: string[];
  meanings: string[];
  literal: string;
}
export interface KanjiDic2 {
  header: unknown;
  kanjidic2: Record<string, SimpleCharacter | undefined>;
}
