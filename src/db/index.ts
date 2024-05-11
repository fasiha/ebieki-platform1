import assert from "assert";
import "dotenv/config";
import SQLite from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import type { DB } from "./db";

assert(process.env.DATABASE_URL);
console.log("OPENING DB", process.env.DATABASE_URL);
const dialect = new SqliteDialect({
  database: new SQLite(process.env.DATABASE_URL),
});

export const db = new Kysely<DB>({ dialect });

const ver = await db
  .selectFrom("_ebieki_db_state")
  .select("schemaVersion")
  .executeTakeFirstOrThrow();
assert(ver.schemaVersion === 1); // change this as the schema migrates?
console.log("VALIDATED SCHEMA VER", ver.schemaVersion);
