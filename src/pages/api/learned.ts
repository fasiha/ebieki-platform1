export const prerender = false; // this needs to be live

import type { APIRoute } from "astro";
import { db } from "../../db";
import type { LearnedResponse } from "./learnedHelper";

const jsonOptions: ResponseInit = {
  headers: {
    "Content-Type": "application/json",
  },
};

export const GET: APIRoute = async ({ request }) => {
  const user = new URL(request.url).searchParams.get("user");
  if (!user) {
    return new Response("user missing", { status: 400 });
  }

  const query = db
    .selectFrom("ebisu")
    .select(({ fn }) => [
      "vocabKanji",
      "direction",
      "buried", // "bare" column, will be chosen from row of `max`, see https://www.sqlite.org/lang_select.html#bare_columns_in_an_aggregate_query
      fn.max<number>("createdMillis").as("createdMillis"),
    ])
    .where("user", "=", user)
    .groupBy(["vocabKanji", "direction"]);
  const results: LearnedResponse = await query.execute();
  return new Response(JSON.stringify(results), jsonOptions);
};
