import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

export * from "./interfaces";
export { entryToGlossParts } from "./helpers";

import type { DependencyGraph, WithDistance } from "./interfaces";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const vocab: WithDistance[] = JSON.parse(
  readFileSync(join(__dirname, "table.json"), "utf8")
);
export const dependencies: DependencyGraph = JSON.parse(
  readFileSync(join(__dirname, "wanikani-kanji-graph.json"), "utf8")
);

const EXTRA_KANJI_BREAKDOWNS: Record<string, string[]> = { 歪: ["不", "正"] };

for (const kanji in EXTRA_KANJI_BREAKDOWNS) {
  if (kanji in dependencies) continue;
  const radicals = EXTRA_KANJI_BREAKDOWNS[kanji];
  dependencies.kanjiToRadicals[kanji] = radicals;
  for (const radical of radicals) {
    if (!(radical in dependencies.radicalToKanjis))
      dependencies.radicalToKanjis[radical] = [];
    dependencies.radicalToKanjis[radical].push(kanji);
  }
}
