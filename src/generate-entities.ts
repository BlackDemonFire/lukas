import { MikroORM, PostgreSqlDriver } from "@mikro-orm/postgresql";
import AppConfig from "./modules/settings.js";
import { Effect, Redacted } from "effect";
import { NodeRuntime } from "@effect/platform-node";

// This script will generate entities from the database. - Development only!
// build with `pnpm run build` and run with `node -r 'dotenv/config' dist/generate-entities.js`

Effect.gen(function* () {
  const cfg = yield* AppConfig;
  const orm = yield* Effect.promise(() =>
    MikroORM.init<PostgreSqlDriver>({
      // we need to disable validation for no entities
      discovery: { warnWhenNoEntities: false },
      dbName: cfg.DB_NAME,
      host: cfg.DB_HOST,
      port: cfg.DB_PORT,
      user: cfg.DB_USER,
      password: Redacted.value(cfg.DB_PASS),
    }),
  );
  yield* Effect.promise(() => orm.entityGenerator.generate({ save: true, path: `${process.cwd()}/src/entities` }));
  yield* Effect.promise(() => orm.close(true));
}).pipe(NodeRuntime.runMain);
