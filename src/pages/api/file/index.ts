export const prerender = false; // needs to be live

import { writeFileSync } from "node:fs";
import { createHash, randomUUID } from "node:crypto";
import sharp from "sharp";

import type { APIRoute } from "astro";
import { db } from "../../../db";

/*
TODO:
1- deal with sha256 collisions (return that uuid)
2- i guess deal with uuid collisions
3- should we sha256 the original PNG input before running Sharp?
*/
export const PUT: APIRoute = async ({ request }) => {
  const originalMime = request.headers.get("content-type");
  const originalBytes = Buffer.from(await request.arrayBuffer());
  if (!originalMime) {
    return new Response("mime missing", { status: 400 });
  }

  const final = { bytes: originalBytes, mime: originalMime };
  if (originalMime.toLowerCase().startsWith("image/")) {
    const start = Date.now();
    const webp = await sharp(originalBytes).toFormat("webp", {}).toBuffer();
    console.log(
      `${Date.now() - start} milliseconds to encode ${
        originalBytes.length
      } bytes of ${originalMime} to ${webp.length} bytes of Webp`
    );
    if (webp.length < originalBytes.length * 0.9) {
      final.bytes = webp;
      final.mime = "image/webp";
    }
  }
  const sha256 = createHash("sha256")
    .update(final.bytes)
    .digest()
    .toString("base64url");

  const exists = await db
    .selectFrom("file")
    .select("uuid")
    .where("sha256", "=", sha256)
    .executeTakeFirst();
  if (exists)
    return new Response(JSON.stringify({ uuid: exists.uuid }), {
      headers: { "Content-Type": "application/json" },
    });

  const uuid = randomUUID();
  const createdMillis = Date.now();
  await db
    .insertInto("file")
    .values({
      mime: final.mime,
      data: final.bytes,
      numBytes: final.bytes.length,
      sha256,
      uuid,
      createdMillis,
      accessedMillis: 0,
      timesAccessed: 0,
      forwardedUuid: "",
    })
    .execute();

  return new Response(JSON.stringify({ uuid }), {
    headers: { "Content-Type": "application/json" },
  });
};
