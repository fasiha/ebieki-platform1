export const prerender = false; // this needs to be live

import type { APIRoute } from "astro";
import { db } from "../../db";
import { predictRecall, type Split3Model } from "../../ebisu/split3";
import { vocab as ebieki, type WithDistance } from "ebieki";
import type { KanaReview, KanjiReview } from "../../apiHelpers/reivewHelper";
import { weightedSample } from "../../utils/randomSample";

const kanjiToEbieki: Record<string, WithDistance> = Object.fromEntries(
  ebieki.map((e) => [e.card.kanji, e])
);

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const user = new URL(request.url).searchParams.get("user");
  if (!user) return new Response("user missing", { status: 400 });
  const directionWanted = url.searchParams.get("direction");

  const now = Date.now();
  let query = db
    .selectFrom("ebisu")
    .select(({ fn }) => [
      "vocabKanji",
      "direction",
      fn.max<number>("createdMillis").as("createdMillis"),
      // "bare" columns, will be chosen from row of `max`, see
      // https://www.sqlite.org/lang_select.html#bare_columns_in_an_aggregate_query
      "model",
      "modelTimeMillis",

      "buried",
      // we'll throw away buried later (hopefully they never
      // dominate, so we don't need to omit those in SQL: it's not
      // just `where buried=0` because we want that filter to be
      // applied AFTER the groupby not before)
    ])
    .where("user", "=", user);
  if (directionWanted) {
    query = query.where("direction", "=", directionWanted);
  }
  const knownVocabs = (
    await query.groupBy(["vocabKanji", "direction"]).execute()
  )
    .filter((x) => !x.buried)
    .map((x) => {
      const modelMapped = JSON.parse(x.model) as Split3Model;
      const pRecall = predictRecall(
        modelMapped,
        elapsedHours(now, x.modelTimeMillis)
      );
      return { ...x, modelMapped, pRecall };
    })
    .sort((a, b) => a.pRecall - b.pRecall);

  if (knownVocabs.length === 0)
    return new Response("no flashcards found", { status: 404 });

  // TODO randomize this a bit, don't always choose the lowest pRecall
  const weakestCard = knownVocabs[0];
  const { vocabKanji, direction } = weakestCard;

  if (!(vocabKanji in kanjiToEbieki)) {
    const msg = `unknown vocabKanji: ${vocabKanji}`;
    console.error(msg);
    return new Response(msg, { status: 500 });
  }

  const weakestEbieki = kanjiToEbieki[vocabKanji];

  if (direction === "kana") {
    // we want (1) similar meanings and (2) similar pronunciation confusers

    const similarMeaning = weakestEbieki.closest.map(
      ({ kanji }) => kanjiToEbieki[kanji]
    );
    if (!similarMeaning.every((x) => x)) {
      const msg = `close vocabKanji not found for ${vocabKanji}`;
      console.error(msg);
      return new Response(msg, { status: 500 });
    }

    const knownCards = knownVocabs.map((x) => kanjiToEbieki[x.vocabKanji]);
    if (!knownCards.every((x) => x)) {
      const msg = `known cards not found`;
      console.error(msg);
      return new Response(msg, { status: 500 });
    }
    const weakestRts = new Set(
      weakestEbieki.furigana
        .map((f) => (typeof f !== "string" ? f.rt : undefined))
        .filter((x): x is string => !!x)
    );
    const similarKanaKnown = mapToWeightsAndSample(
      knownCards,
      (ee) => {
        if (ee.card.kanji === vocabKanji) return 0;
        return furiganaToWeight(ee.furigana, weakestRts);
      },
      10
    );

    const knownVocabKanji = new Set(knownCards.map((x) => x.card.kanji));
    const similarKanaUnknown = mapToWeightsAndSample(
      ebieki,
      (ee) => {
        if (ee.card.kanji === vocabKanji || knownVocabKanji.has(ee.card.kanji))
          return 0;
        return furiganaToWeight(ee.furigana, weakestRts);
      },
      10
    );

    const result: KanaReview = {
      direction: "kana",
      target: weakestEbieki,
      similarMeaning: similarMeaning.slice(0, 10),
      similarKanaKnown,
      similarKanaUnknown,
    };
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } else if (direction === "kanji") {
    const result: KanjiReview = { direction: "kanji", target: weakestEbieki };
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } else {
    const msg = `unknown direction: ${direction}`;
    console.error(msg);
    return new Response(msg, { status: 500 });
  }

  return new Response("");
};

const HOURS_PER_MILLISECONDS = 1 / 3600e3;
const elapsedHours = (nowMs: number, thenMs: number): number =>
  Math.abs(nowMs - thenMs) * HOURS_PER_MILLISECONDS;

const mapToWeightsAndSample = <T>(
  arr: T[],
  toWeight: (t: T) => number,
  numSamples: number
): T[] => {
  const weightedArr = arr
    .map((x) => ({ x, w: toWeight(x) }))
    .filter(({ w }) => w > 0);
  return weightedSample(
    weightedArr,
    weightedArr.map(({ w }) => w),
    numSamples
  ).map(({ x }) => x);
};

const furiganaToWeight = (
  f: WithDistance["furigana"],
  targetReadings: Set<string>
): number => {
  const hits = f.filter(
    (f) => typeof f !== "string" && targetReadings.has(f.rt)
  ).length;
  return hits === 0 ? 1 : hits * 1000;
};
