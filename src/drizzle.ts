import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import logger from "./modules/logger.js";
import settings from "./modules/settings.js";

const sql = postgres({
  host: settings.DB_HOST,
  port: settings.DB_PORT,
  user: settings.DB_USER,
  password: settings.DB_PASS,
  database: settings.DB_NAME,
});

export const db = drizzle(sql, {
  logger: {
    logQuery: (query, params) => {
      logger.debug(`[Database] query ${query} [${params}]`);
    },
  },
});
await migrate(db, { migrationsFolder: "drizzle" });
