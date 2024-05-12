export const prerender = false; // this needs to be live

import type { APIRoute } from "astro";
import { db } from "../../db";

export const GET: APIRoute = async () => {
  const query = db.selectFrom("user").select("name").distinct();
  console.log("sql", query.compile().sql);
  const users = await query.execute();
  return new Response(JSON.stringify(users.map((o) => o.name)), jsonOptions);
};

const jsonOptions: ResponseInit = {
  headers: {
    "Content-Type": "application/json",
  },
};

export const PUT: APIRoute = async ({ request }) => {
  const { name } = (await request.json()) || {};
  if (!(typeof name === "string" && name)) {
    return new Response("?", { status: 400 });
  }
  // TODO handle uniqueness constraint exceptions
  await db.insertInto("user").values({ name }).executeTakeFirst();
  return new Response("ok");
};
