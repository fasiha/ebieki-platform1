export const prerender = false; // this needs to be live

import type { APIRoute } from "astro";
import { db } from "../../db";
import type { Args } from "./unlearnHelper";

export const PUT: APIRoute = async ({ request }) => {
  const { user, vocabKanji, direction } = (await request.json()) as Args;
  const res = await db.transaction().execute(async (tx) => {
    const prev = await tx
      .selectFrom("ebisu")
      .selectAll()
      .where("user", "=", user)
      .where("vocabKanji", "=", vocabKanji)
      .where("direction", "=", direction)
      .orderBy("createdMillis", "desc")
      .limit(1)
      .executeTakeFirst();
    if (!(prev && !prev.buried)) {
      return undefined;
    }
    return tx
      .insertInto("ebisu")
      .values({
        ...prev,
        id: undefined,
        buried: 1,
        quizMeta: JSON.stringify({ note: "bury" }),
        createdMillis: Date.now(),
      })
      .execute();
  });
  return new Response("ok", { status: res ? 200 : 304 });
};
