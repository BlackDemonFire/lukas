import type { EntityClass, EntityRepository } from "@mikro-orm/core";
import { EntityManager, MikroORM } from "@mikro-orm/postgresql";
import { Context, Effect, Layer, Redacted } from "effect";
import mikroOrmConfig from "./mikro-orm.config.js";
import SettingsMod from "./modules/settings.js";

export interface DatabaseService {
  readonly fork: Effect.Effect<EntityManager>;
  readonly close: Effect.Effect<void>;
}

export class Database extends Context.Service<Database, DatabaseService>()("Database") {}

export const DatabaseLive = Layer.effect(
  Database,
  Effect.gen(function* () {
    const config = yield* SettingsMod;
    const ctx = yield* Effect.context();

    const orm = yield* Effect.promise(() =>
      MikroORM.init({
        ...mikroOrmConfig,
        user: config.DB_USER,
        dbName: config.DB_NAME,
        port: config.DB_PORT,
        password: Redacted.value(config.DB_PASS),
        host: config.DB_HOST,
        logger: (m) => Effect.runForkWith(ctx)(Effect.log("[Database] " + m)),
      }),
    );
    yield* Effect.logInfo("Database connected");
    const migs = yield* Effect.promise(() => orm.migrator.up());
    for (const migration of migs) {
      yield* Effect.logInfo("Ran migration " + migration.name);
    }

    return {
      fork: Effect.gen(function* () {
        yield* Effect.annotateCurrentSpan({ attributes: { "db.system": "postgresql" } });
        return orm.em.fork();
      }),
      close: Effect.promise(() => orm.close()),
    };
  }),
);

export const withRepository = <Entity extends object, A>(
  entity: EntityClass<Entity>,
  f: (repo: EntityRepository<Entity>, em: EntityManager) => Effect.Effect<A>,
) =>
  Effect.gen(function* () {
    const db = yield* Database;

    const em = yield* db.fork;

    return yield* f(em.getRepository(entity), em);
  });
