import { pgTable, text } from "drizzle-orm/pg-core";

export const userdb = pgTable("userdb", {
  id: text("id").primaryKey(),
  giftype: text("giftype"),
  color: text("color"),
  name: text("name"),
});

export type DBUser = typeof userdb.$inferSelect;