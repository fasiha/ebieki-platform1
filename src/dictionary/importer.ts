import { vocab as ebieki } from "../ebieki";

import { db } from "../db";

import type { JmdictVocab } from "../db/db";

export const importWanikani = async () => {
  const query = db.replaceInto("jmdictVocab");
  const now = Date.now();
  const all: Omit<JmdictVocab, "id">[] = ebieki.map((e) => ({
    createdMillis: now,
    vocabKanji: e.card.kanji,
    json: JSON.stringify(e),
    level: e.card.level,
    lessonPosition: e.card.lesson_position,
    inWanikani: 1,
  }));
  const CHUNK_SIZE = 100;
  for (let i = 0; ; i += CHUNK_SIZE) {
    const chunk = all.slice(i, i + CHUNK_SIZE);
    if (chunk.length === 0) break;
    await query.values(chunk).execute();
  }
};
