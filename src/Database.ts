import { EntityManager, MikroORM } from "@mikro-orm/postgresql";
import { Context, Effect, Layer, Redacted } from "effect";
import mikroOrmConfig from "./mikro-orm.config.js";
import SettingsMod from "./modules/settings.js";

export interface DatabaseService {
  readonly orm: EntityManager;
  readonly close: Effect.Effect<void>;
}

export class Database extends Context.Service<Database, DatabaseService>()("Database") {}

export const DatabaseLive = Layer.effect(
  Database,
  Effect.gen(function* () {
    const config = yield* SettingsMod;

    const orm = yield* Effect.promise(() =>
      MikroORM.init({
        ...mikroOrmConfig,
        user: config.DB_USER,
        dbName: config.DB_NAME,
        port: config.DB_PORT,
        password: Redacted.value(config.DB_PASS),
        host: config.DB_HOST,
        logger: (m) => Effect.log("[Database] " + m),
      }),
    );
    yield* Effect.logInfo("Database connected");
    const migs = yield* Effect.promise(() => orm.migrator.up());
    for (const migration of migs) {
      yield* Effect.logInfo("Ran migration " + migration.name);
    }

    return { orm: orm.em, close: Effect.promise(() => orm.close()) };
  }),
);
