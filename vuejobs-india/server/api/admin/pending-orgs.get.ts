import { db } from "../../database/db";
import { organization } from "../../database/schema/organization";
import { eq } from "drizzle-orm";
import { auth } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers });

  if (!session || session.user.role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Admin access required."
    });
  }

  // Fetch all organizations that are not verified
  const pendingOrgs = await db
    .select()
    .from(organization)
    .where(eq(organization.verified, false));

  return pendingOrgs;
});
