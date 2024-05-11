import { defineConfig } from "astro/config";
import solidJs from "@astrojs/solid-js";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  integrations: [solidJs({ devtools: true })],
  output: "hybrid",
  adapter: node({
    mode: "standalone",
  }),
});
