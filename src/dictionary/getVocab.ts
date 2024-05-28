import { type WithDistance } from "../ebieki";
import { db } from "../db";

export const getVocab = async () => {
  // TODO add in-memory caching to avoid hitting SQLite every lookup
  const vocab: WithDistance[] = (
    await db
      .selectFrom("jmdictVocab")
      .select("json")
      .orderBy(["level", "lessonPosition"])
      .execute()
  ).map((x) => JSON.parse(x.json));
  return vocab;
};
