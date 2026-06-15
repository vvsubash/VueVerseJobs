import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  logo: text("logo"),
  createdAt: timestamp("created_at").notNull(),
  metadata: text("metadata"),
  verified: boolean("verified").default(false).notNull(),
});
