import { pgTable, text } from "drizzle-orm/pg-core";

export const settings = pgTable("settings", {
  guild: text("guild").primaryKey(),
  language: text("language"),
});

export type Settings = typeof settings.$inferSelect;
