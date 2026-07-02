/**
 * @openapi
 * tags:
 *   - name: Health
 *     description: Health checks
 *
 * /api/health/database:
 *   get:
 *     tags: [Health]
 *     summary: Check database connectivity
 *     responses:
 *       200:
 *         description: Database is reachable
 *       503:
 *         description: Database unreachable
 */
import { db } from "../../database/db";
import { test } from "../../database/schema";

export default defineEventHandler(async () => {
  try {
    await db.select().from(test).limit(1);
    return { status: "ok" };
  } catch (error) {
    throw createError({ statusCode: 503, message: "Database unreachable" });
  }
});
