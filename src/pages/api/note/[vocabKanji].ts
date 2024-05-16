export const prerender = false; // needs to be live

import type { APIRoute } from "astro";
import { db } from "../../../db";
import type { PutArgs } from "../../../apiHelpers/noteHelper";

export const GET: APIRoute = async ({ params, request }) => {
  const { vocabKanji } = params;
  if (!vocabKanji) return new Response("vocabKanji missing", { status: 400 });
  const user = new URL(request.url).searchParams.get("user");
  if (!user) return new Response("user missing", { status: 400 });

  const res = await db
    .selectFrom("note")
    .select("note")
    .where("user", "=", user)
    .where("vocabKanji", "=", vocabKanji)
    .limit(1)
    .orderBy("createdMillis", "desc")
    .executeTakeFirst();
  if (res) return new Response(res.note); // note, not JSON
  return new Response("no note", { status: 404 });
};

export const PUT: APIRoute = async ({ params, request }) => {
  const { vocabKanji } = params;
  if (!vocabKanji) return new Response("vocabKanji missing", { status: 400 });
  const json: PutArgs = await request.json();
  const user = new URL(request.url).searchParams.get("user") || json.user;
  if (!user) return new Response("user missing", { status: 400 });
  const note = json.note;
  if (typeof note !== "string")
    return new Response("note missing", { status: 400 });

  // TODO deal with constraint failures
  // TODO dedupe: don't reinsert same text as before (we can have a cleanup job later)
  await db
    .insertInto("note")
    .values({
      vocabKanji,
      user,
      note,
      createdMillis: Date.now(),
      deviceId: "",
    })
    .execute();
  return new Response("ok");
};
