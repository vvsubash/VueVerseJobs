import { defineNuxtModule } from "@nuxt/kit";
import { resolve } from "path";
import { writeFileSync } from "fs";
import swaggerJsdoc from "swagger-jsdoc";

export default defineNuxtModule({
  meta: { name: "openapi-jsdoc" },
  setup(_opts, nuxt) {
    const generate = () => {
      const spec = swaggerJsdoc({
        definition: {
          openapi: "3.1.0",
          info: { title: "VueJobs India API", version: "1.0.0" },
          servers: [{ url: "http://localhost:3000", description: "Local" }],
        },
        apis: [resolve(nuxt.options.rootDir, "server/**/*.ts")],
      });
      writeFileSync(
        resolve(nuxt.options.rootDir, "public/openapi.json"),
        JSON.stringify(spec, null, 2),
      );
    };

    nuxt.hook("ready", generate);
    nuxt.hook("builder:watch", (_, path) => {
      if (path.startsWith("server/")) generate();
    });
    nuxt.hook("build:before", generate);
  },
});
