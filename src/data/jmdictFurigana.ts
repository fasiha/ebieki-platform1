import type { JmdictFurigana } from "../ebieki";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const jmdictFurigana: JmdictFurigana[] = JSON.parse(
  readFileSync(
    join(__dirname, "..", "..", "data", "JmdictFurigana.json"),
    "utf8"
  ).trim()
);
const nameFurigana: JmdictFurigana[] = JSON.parse(
  readFileSync(
    join(__dirname, "..", "..", "data", "JmnedictFurigana.json"),
    "utf8"
  ).trim()
);

export const getJmdictFurigana = (
  kanji: string,
  kanas: string[]
): JmdictFurigana["furigana"] => {
  const normal = jmdictFurigana.find(
    (x) => x.text === kanji && kanas.includes(x.reading)
  );
  if (normal) return normal.furigana;

  const name = nameFurigana.find(
    (x) => x.text === kanji && kanas.includes(x.reading)
  );
  if (name) return name.furigana;

  throw new Error("Furigana not found");
};
