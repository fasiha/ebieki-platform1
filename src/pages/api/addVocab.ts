/**
 * Hit this with
 *
 * curl -XPUT -H 'Content-Type: application/json' -d'{"kanji":"満ちる", "kanas":["みちる"]}' http://localhost:4334/api/addVocab
 */

export const prerender = false; // this needs to be live

import { join, dirname } from "node:path";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import type { APIRoute } from "astro";
import type { Simplified, Word } from "../../ebieki";
import type { Args } from "../../apiHelpers/addVocabHelper";
import { submitJmdict } from "../../dictionary/addVocab";
const __dirname = dirname(fileURLToPath(import.meta.url));

// don't load JMdict unless we really need to, since it takes several seconds
let dictPromise: Promise<Word[]> | undefined;
const setup = () => {
  if (!dictPromise) {
    dictPromise = readFile(
      join(__dirname, "..", "..", "..", "data", "jmdict-eng-3.5.0.json"),
      "utf8"
    ).then((raw) => (JSON.parse(raw) as Simplified).words);
  }
  return dictPromise;
};

export const PUT: APIRoute = async ({ request }) => {
  const dict = await setup();
  const { kanji, kanas } = (await request.json()) as Args;
  if (
    !(
      typeof kanji === "string" &&
      Array.isArray(kanas) &&
      kanas.every((k) => typeof k === "string") &&
      kanas.length > 0
    )
  )
    return new Response("invalid", { status: 400 });

  const results = dict.filter(
    (w) =>
      w.kanji.some((k) => k.text === kanji) &&
      kanas.every((kana) => w.kana.some((k) => k.text === kana))
  );

  if (results.length === 1) {
    try {
      const updated = await submitJmdict(results[0], kanji, kanas);
      return new Response(
        JSON.stringify({ word: results[0], updated }),
        jsonOptions
      );
    } catch (e) {
      console.error("error", e);
      return new Response(JSON.stringify({ error: e, word: results[0] }), {
        ...jsonOptions,
        status: 500,
      });
    }
  }
  return new Response(
    JSON.stringify({ msg: "didn't find one match, bailing", results }),
    { ...jsonOptions, status: 400 }
  );
};

const jsonOptions: ResponseInit = {
  headers: {
    "Content-Type": "application/json",
  },
};
