import { Database } from "@/Database";
import { Userdb } from "@/entities/Userdb.js";
import { wrap } from "@mikro-orm/core";
import type { User } from "discord.js";
import { Context, Effect, Layer, pipe } from "effect";

interface IUserRepository {
  getColor: (user: User) => Effect.Effect<string>;
  getGifType: (user: User) => Effect.Effect<string>;
  getName: (user: User) => Effect.Effect<string>;
  setName: (user: User, newName: string) => Effect.Effect<void>;
  ensureUser: (user: User) => Effect.Effect<void>;
  setColor: (user: User, color: string) => Effect.Effect<void>;
  setGifType: (user: User, gifType: string) => Effect.Effect<void>;
}

export class UserRepository extends Context.Service<UserRepository, IUserRepository>()("UserRepository") {}

export const UserRepositoryLive = Layer.effect(
  UserRepository,
  Effect.gen(function* () {
    const db = yield* Database;

    return {
      getColor: Effect.fn("UserRepository.getColor")(function* (user: User) {
        const em = yield* db.fork;
        const repo = em.getRepository(Userdb);
        return yield* pipe(
          Effect.promise(() => repo.findOne({ id: user.id }, { fields: ["color"] })),
          Effect.map((e) => e?.color ?? "Random"),
        );
      }),
      getGifType: Effect.fn("UserRepository.getGifType")(function* (user: User) {
        const em = yield* db.fork;
        const repo = em.getRepository(Userdb);
        return yield* pipe(
          Effect.promise(() => repo.findOne({ id: user.id })),
          Effect.map((e) => e?.giftype ?? "anime"),
        );
      }),
      getName: Effect.fn("UserReporitory.getName")(function* (user: User) {
        const em = yield* db.fork;
        const repo = em.getRepository(Userdb);
        return yield* pipe(
          Effect.promise(() => repo.findOne({ id: user.id })),
          Effect.map((e) => e?.name ?? ""),
        );
      }),
      ensureUser: Effect.fn("UserRepository.ensureUser")(function* (user: User) {
        const em = yield* db.fork;
        const repo = em.getRepository(Userdb);
        const existingUser = yield* Effect.promise(() => repo.findOne({ id: user.id }));
        if (existingUser) return;
        const userDBO = repo.create({ id: user.id, giftype: "anime", color: "Random", name: user.username ?? "" });
        em.persist(userDBO);
        yield* Effect.promise(() => em.flush());
      }),
      setColor: Effect.fn("UserRepository.setColor")(function* (user: User, color: string) {
        const em = yield* db.fork;
        const repo = em.getRepository(Userdb);
        const userDBO = yield* Effect.promise(() => repo.findOne({ id: user.id }));
        if (!userDBO) {
          yield* Effect.logWarning("Tried to set the color for a user not in db: ", user.id);
          return;
        }
        wrap(userDBO).assign({ color });
        yield* Effect.promise(() => em.flush());
      }),
      setGifType: Effect.fn("UserRepository.setGifType")(function* (user: User, giftype: string) {
        const em = yield* db.fork;
        const repo = em.getRepository(Userdb);
        const userDBO = yield* Effect.promise(() => repo.findOne({ id: user.id }));
        if (!userDBO) return;
        wrap(userDBO).assign({ giftype });
        yield* Effect.promise(() => em.flush());
      }),
      setName: Effect.fn("UserRepository.setName")(function* (user: User, name: string) {
        const em = yield* db.fork;
        const repo = em.getRepository(Userdb);
        const userDBO = yield* Effect.promise(() => repo.findOne({ id: user.id }));
        if (!userDBO) return;
        wrap(userDBO).assign({ name });
        yield* Effect.promise(() => em.flush());
      }),
    };
  }),
);
