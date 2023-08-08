import { PostgreSqlDriver, defineConfig } from "@mikro-orm/postgresql";
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
  extensions: [],
});
