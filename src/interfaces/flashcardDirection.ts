export const ALLOWED_DIRECTIONS = ["kanji", "kana"] as const;
export type Direction = (typeof ALLOWED_DIRECTIONS)[number];

export const isDirection = (s: string): s is Direction =>
  ALLOWED_DIRECTIONS.includes(s as any);
