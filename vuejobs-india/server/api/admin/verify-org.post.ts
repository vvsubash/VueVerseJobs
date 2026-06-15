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

  const { organizationId, verified } = await readBody(event);

  if (!organizationId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: organizationId is required."
    });
  }

  // Update verified status
  await db
    .update(organization)
    .set({ verified: !!verified })
    .where(eq(organization.id, organizationId));

  return { success: true };
});
