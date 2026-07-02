import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
// This connection string is also being used out of nuxt so adding env variable as backup
let connectionString = process.env.NUXT_DATABASE_URL || "";

try {
  const config = useRuntimeConfig();
  if (config?.databaseUrl) {
    connectionString = config.databaseUrl;
  }
} catch (e) {
  // useRuntimeConfig is not defined outside the Nuxt context
}

if (!connectionString) {
  throw new Error("NUXT_DATABASE_URL is not set in environment or runtime configuration.");
}

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
