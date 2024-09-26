import { pgTable, text } from "drizzle-orm/pg-core";

export const dsachars = pgTable("dsachars", {
  prefix: text("prefix").notNull(),
  avatar: text("avatar"),
  displayname: text("displayname").notNull(),
});
export type DsaChar = typeof dsachars.$inferSelect;
