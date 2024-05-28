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
