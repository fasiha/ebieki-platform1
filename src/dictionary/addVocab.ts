import tmp from "tmp-promise";
import fs from "node:fs/promises";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

import {
  dependencies,
  type Word,
  type WithDistance,
  entryToGlossParts,
} from "../ebieki";
import { db } from "../db";
import { getJmdictFurigana } from "../data/jmdictFurigana";
import { getVocab } from "./getVocab";

const execPromise = promisify(exec);

export const dependenciesNeeded = (vocab: string): string[] =>
  vocab
    .match(/\p{Script=Han}/gu)
    ?.filter((c) => !(c in dependencies.kanjiToRadicals)) ?? [];

export const submitJmdict = async (
  word: Word,
  kanji: string,
  kanas: string[]
): Promise<WithDistance[]> => {
  // checks
  if (!word.kanji.some((k) => k.text === kanji))
    throw new Error("kanji not in entry");
  const allKanjiHaveDependencies = dependenciesNeeded(kanji).length === 0;
  if (!allKanjiHaveDependencies) throw new Error("need kanji breakdown");

  const alreadyExisting = await db
    .selectFrom("jmdictVocab")
    .select("vocabKanji")
    .where("vocabKanji", "=", kanji)
    .execute();
  if (alreadyExisting.length > 0) return [];

  // prep
  const furigana = getJmdictFurigana(kanji, kanas);
  const glosses = entryToGlossParts(word, kanji, kanas[0]);

  // almost there
  const newCard: WithDistance = {
    card: {
      kanas,
      kanji,
      level: 9999,
      lesson_position: Number(word.id),
      gloss: "",
    },
    glossObj: word,
    furigana,
    ...glosses,
    closest: [],
  };
  // insert this now even though we don't have `closest` yet
  await db
    .replaceInto("jmdictVocab")
    .values({
      createdMillis: Date.now(),
      vocabKanji: kanji,
      json: JSON.stringify(newCard),
      level: newCard.card.level,
      lessonPosition: newCard.card.lesson_position,
      inWanikani: 0,
    })
    .execute();

  // prep distances
  const temp = await tmp.file();
  await fs.writeFile(
    temp.path,
    JSON.stringify((await getVocab()).concat(newCard))
  );
  await execPromise(`python calculateDistances.py ${temp.path}`, {
    cwd: __dirname,
  });
  const distancesAdded: WithDistance[] = JSON.parse(
    await fs.readFile(temp.path, "utf8")
  );
  await temp.cleanup();

  // insert the result of the above, and overwriting the empty `closest`
  const now = Date.now();
  await db
    .replaceInto("jmdictVocab")
    .values(
      distancesAdded.map((x) => ({
        createdMillis: now,
        vocabKanji: x.card.kanji,
        json: JSON.stringify(x),
        level: x.card.level,
        lessonPosition: x.card.lesson_position,
        inWanikani: Number(x.card.level < 100),
      }))
    )
    .execute();
  return distancesAdded;
};
