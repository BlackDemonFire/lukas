import { MikroORM, PostgreSqlDriver } from "@mikro-orm/postgresql";
import settings from "./modules/settings.js";

// This script will generate entities from the database. - Development only!
// build with `pnpm run build` and run with `node -r 'dotenv/config' dist/generate-entities.js`

(async () => {
  const orm = await MikroORM.init<PostgreSqlDriver>({
    type: "postgresql",
    discovery: {
      // we need to disable validation for no entities
      warnWhenNoEntities: false,
    },
    dbName: settings.DB_NAME,
    host: settings.DB_HOST,
    port: settings.DB_PORT,
    user: settings.DB_USER,
    password: settings.DB_PASS,
  });
  const generator = orm.getEntityGenerator();
  await generator.generate({
    save: true,
    baseDir: `${process.cwd()}/src/entities`,
  });
  await orm.close(true);
})();
