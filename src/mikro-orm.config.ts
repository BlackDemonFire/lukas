import { Migrator } from "@mikro-orm/migrations";
import { PostgreSqlDriver, defineConfig } from "@mikro-orm/postgresql";

export default defineConfig({
  driver: PostgreSqlDriver,
  entities: ["./dist/entities"],
  entitiesTs: ["./src/entities"],
  extensions: [Migrator],

  migrations: { path: "dist/migrations", pathTs: "src/migrations" },
});
