import { pgTable, text } from "drizzle-orm/pg-core";

export const gifdb = pgTable("gifdb", {
  url: text("url").notNull(),
  giftype: text("giftype"),
  actiontype: text("actiontype"),
});

export type Gif = typeof gifdb.$inferSelect;
