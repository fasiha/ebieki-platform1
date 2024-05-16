export const prerender = false; // this needs to be live

import type { APIRoute } from "astro";
import { db } from "../../db";
import type { Args } from "../../apiHelpers/learnHelper";

export const PUT: APIRoute = async ({ request }) => {
  const {
    user,
    vocabKanji,
    direction,
    model,
    modelTimeMillis,
    quizMeta = {},
  } = (await request.json()) as Args;
  await db
    .insertInto("ebisu")
    .values({
      user,
      vocabKanji,
      direction,
      createdMillis: Date.now(),
      buried: 0,
      deviceId: "",
      modelTimeMillis: modelTimeMillis,
      model: JSON.stringify(model),
      quizMeta: JSON.stringify(quizMeta),
    })
    .execute();
  return new Response("ok");
};
