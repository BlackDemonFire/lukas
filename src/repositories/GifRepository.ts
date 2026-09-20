import { Database } from "@/Database";
import { Gifdb } from "@/entities/Gifdb";
import type { SqlEntityRepository } from "@mikro-orm/postgresql";
import { Context, Effect, Layer, pipe, Random } from "effect";
export interface IGifRepository {
  createGif: (url: string, actionType: string, gifType: string) => Effect.Effect<void>;
  getGifTypes: () => Effect.Effect<string[]>;
  getGifactions: () => Effect.Effect<string[]>;
  removeGif: (url: string) => Effect.Effect<number>;
  getGif: (actionType: string, gifType: string) => Effect.Effect<string>;
}

export class GifRepository extends Context.Service<GifRepository, IGifRepository>()("GifRepository") {}

export const GifRepositoryLive = Layer.effect(
  GifRepository,
  Effect.gen(function* () {
    const db = yield* Database;

    const findRandomOne = Effect.fnUntraced(function* (
      repo: SqlEntityRepository<Gifdb>,
      where: Record<string, string>,
      count: number,
    ) {
      const offset = yield* Random.nextIntBetween(0, count - 1);
      return yield* Effect.promise(() => repo.findOne(where, { offset }));
    });

    return {
      createGif: Effect.fn("GifRepository.createGif")(function* (url: string, actiontype: string, giftype: string) {
        const em = yield* db.fork;
        const repo = em.getRepository(Gifdb);
        const gif = repo.create({ url, actiontype, giftype });
        return yield* Effect.promise(() => em.persist(gif).flush());
      }),
      getGifTypes: Effect.fn("GifRepository.getGifTypes")(function* () {
        const em = yield* db.fork;
        const query = em.createQueryBuilder(Gifdb);
        return yield* pipe(
          Effect.promise(() => query.select("giftype").distinct().execute()),
          Effect.map((a) => a.filter((row) => !!row.giftype).map((row) => row.giftype!)),
        );
      }),
      getGifactions: Effect.fn("GifRepository.getGifactions")(function* () {
        const em = yield* db.fork;
        const qb = em.createQueryBuilder(Gifdb);
        return yield* pipe(
          Effect.promise(() => qb.select("actiontype").distinct().execute()),
          Effect.map((d) => d.filter((row) => !!row.actiontype).map((row) => row.actiontype!)),
        );
      }),
      removeGif: Effect.fn("GifRepository.removeGif")(function* (url: string) {
        const em = yield* db.fork;
        const repo = em.getRepository(Gifdb);
        return yield* Effect.promise(() => repo.nativeDelete({ url }));
      }),

      getGif: Effect.fn("GifRepository.getGif")(function* (actiontype: string, giftype: string) {
        const em = yield* db.fork;
        const repo = em.getRepository(Gifdb);
        return yield* pipe(
          Effect.promise(() => repo.count({ actiontype, giftype })),
          Effect.flatMap((count) =>
            count > 0
              ? findRandomOne(repo, { actiontype, giftype }, count)
              : pipe(
                  Effect.promise(() => repo.count({ actiontype })),
                  Effect.flatMap((cnt) => findRandomOne(repo, { actiontype }, cnt)),
                ),
          ),
          Effect.map((e) => e?.url ?? ""),
        );
      }),
    };
  }),
);
