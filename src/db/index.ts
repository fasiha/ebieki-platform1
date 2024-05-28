import "dotenv/config";
import SQLite from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import type { DB } from "./db";
import { vocab as ebieki } from "../ebieki";
import { importWanikani } from "../dictionary/importer";

if (!process.env.DATABASE_URL) throw new Error("no url?");
const dialect = new SqliteDialect({
  database: new SQLite(process.env.DATABASE_URL),
});

export const db = new Kysely<DB>({ dialect });

const ver = await db
  .selectFrom("_ebieki_db_state")
  .select("schemaVersion")
  .executeTakeFirstOrThrow();
// change this as the schema migrates?
if (ver.schemaVersion !== 1) throw new Error("bad ver?");

const hasWanikani = await db
  .selectFrom("jmdictVocab")
  .select(({ fn }) => [fn.count("id").as("cardinality")])
  .where("inWanikani", "=", 1)
  .executeTakeFirst();
if (Number(hasWanikani?.cardinality ?? 0) < ebieki.length) {
  console.log("importing wanikani:", hasWanikani, ebieki.length);
  await importWanikani();
}
