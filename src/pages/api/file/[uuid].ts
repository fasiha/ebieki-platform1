export const prerender = false; // needs to be live

import type { APIRoute } from "astro";
import { db } from "../../../db";

export const GET: APIRoute = async ({ params }) => {
  const { uuid } = params;
  if (!uuid) return new Response("uuid missing", { status: 400 });

  const res = await db
    .selectFrom("file")
    .select(["data", "mime"])
    .where("uuid", "=", uuid)
    .executeTakeFirst();

  if (!res) return new Response("uuid not found", { status: 404 });
  return new Response(res.data, { headers: { "Content-Type": res.mime } });
};
