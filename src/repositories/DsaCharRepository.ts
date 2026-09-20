import { Database } from "@/Database";
import { Dsachars } from "@/entities/Dsachars";
import { Context, Effect, Layer, Option, pipe } from "effect";

interface IDsaCharRepository {
  deleteCharacter: (prefix: string) => Effect.Effect<void>;
  getCharacter: (prefix: string) => Effect.Effect<Option.Option<Dsachars>>;
  createCharacter: (prefix: string, displayname: string, avatar: string) => Effect.Effect<void>;
}

export class DsaCharRepository extends Context.Service<DsaCharRepository, IDsaCharRepository>()("DsaCharRepository") {}
export const DsaCharRepositoryLive = Layer.effect(
  DsaCharRepository,
  Effect.gen(function* () {
    const db = yield* Database;

    return {
      deleteCharacter: Effect.fn("DsaCharRepository.deleteCharacter")(function* (prefix: string) {
        const em = yield* db.fork;
        const repo = em.getRepository(Dsachars);
        return yield* Effect.promise(() => repo.nativeDelete({ prefix }));
      }),
      getCharacter: Effect.fn("DsaCharRepository.getCharacter")(function* (prefix: string) {
        const em = yield* db.fork;
        const repo = em.getRepository(Dsachars);
        return yield* pipe(
          Effect.promise(() => repo.findOne({ prefix })),
          Effect.map((maybeChar) => Option.fromNullOr(maybeChar)),
        );
      }),
      createCharacter: Effect.fn("DsaCharRepository.createCharacter")(function* (
        prefix: string,
        displayname: string,
        avatar: string,
      ) {
        const em = yield* db.fork;
        const repo = em.getRepository(Dsachars);
        const char = repo.create({ prefix, avatar, displayname });
        return yield* Effect.promise(() => em.persist(char).flush());
      }),
    };
  }),
);
