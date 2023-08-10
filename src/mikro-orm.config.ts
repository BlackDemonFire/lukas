import { Logger } from "@mikro-orm/core";
import { Migrator } from "@mikro-orm/migrations";
import { PostgreSqlDriver, defineConfig } from "@mikro-orm/postgresql";
import logger from "./modules/logger.js";
import settings from "./modules/settings.js";

export default defineConfig({
  driver: PostgreSqlDriver,
  dbName: settings.DB_NAME,
  host: settings.DB_HOST,
  port: settings.DB_PORT,
  user: settings.DB_USER,
  password: settings.DB_PASS,
  type: "postgresql",
  entities: ["./dist/entities"],
  entitiesTs: ["./src/entities"],
  // ...
  extensions: [Migrator],
  loggerFactory: (): Logger => {
    return {
      log: (namespace, message) => {
        logger.debug(`[Database::${namespace}] ${message}`);
      },
      error: (namespace, message) => {
        logger.error(`[Database::${namespace}] ${message}`);
      },
      warn: (namespace, message) => {
        logger.warn(`[Database::${namespace}] ${message}`);
      },
      logQuery: (context) => {
        logger.debug(
          `[Database] query ${context.query} took ${context.took}ms `,
        );
      },
      setDebugMode: (debugMode) => {
        logger.debug(`[Database::debugMode] ${debugMode}`);
      },
      isEnabled: (namespace) => {
        logger.debug(`[Database] ${namespace}`);
        return true;
      },
    };
  },
  migrations: {
    path: "dist/migrations",
    pathTs: "src/migrations",
  },
});
