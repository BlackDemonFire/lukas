import { Database } from "@/Database";
import { Settings } from "@/entities/Settings";
import { wrap } from "@mikro-orm/core";
import type { Guild, Snowflake } from "discord.js";
import { Context, Effect, Layer, pipe } from "effect";

interface ISettingsRepository {
  getLang: (guild: Guild | Snowflake) => Effect.Effect<string>;
  getAutorollEnabled: (guild: Guild) => Effect.Effect<boolean>;
  ensureGuildSettings: (guild: Guild, lang: string) => Effect.Effect<void>;
  setLang: (guild: Guild, lang: string) => Effect.Effect<void>;
  setAutorollEnabled: (guild: Guild, enabled: boolean) => Effect.Effect<void>;
}

export class SettingsRepository extends Context.Service<SettingsRepository, ISettingsRepository>()(
  "SettingsRepository",
) {}

export const SettingsRepositoryLive = Layer.effect(
  SettingsRepository,
  Effect.gen(function* () {
    const db = yield* Database;
    const getRepo = () => {
      const orm = db.orm.fork();
      return { repo: orm.getRepository(Settings), em: orm };
    };
    return {
      getLang: Effect.fn("SettingsRepository.getLang")(function* (guild: Guild | Snowflake) {
        const { repo } = getRepo();
        return yield* pipe(
          Effect.promise(() => repo.findOne({ id: typeof guild === "object" ? guild.id : guild })),
          Effect.map((e) => e?.language ?? ""),
        );
      }),
      getAutorollEnabled: Effect.fn("SettingsRepository.getAutorollEnabled")(function* (guild: Guild) {
        const { repo } = getRepo();
        return yield* pipe(
          Effect.promise(() => repo.findOne({ id: guild.id })),
          Effect.map((e) => e?.autorollEnabled ?? false),
        );
      }),
      ensureGuildSettings: Effect.fn("SettingsRepository.ensureGuildSettings")(function* (guild: Guild, lang: string) {
        const { repo, em } = getRepo();
        const existingSettings = yield* Effect.promise(() => repo.findOne({ id: guild.id }));
        if (existingSettings) return;
        const settings = repo.create({ id: guild.id, language: lang });
        em.persist(settings);
        yield* Effect.promise(() => em.flush());
      }),
      setLang: Effect.fn("SettingsRepository.setLang")(function* (guild: Guild, lang: string) {
        const { repo, em } = getRepo();
        const settings = yield* Effect.promise(() => repo.findOneOrFail({ id: guild.id }));
        yield* Effect.logDebug(`Setting language for ${guild.name} to ${lang}`);
        wrap(settings).assign({ language: lang }, { mergeObjectProperties: true });
        yield* Effect.promise(() => em.flush());
      }),
      setAutorollEnabled: Effect.fn("SettingsRepository.setAutorollEnabled")(function* (
        guild: Guild,
        enabled: boolean,
      ) {
        const { repo, em } = getRepo();
        const settings = yield* Effect.promise(() => repo.findOneOrFail({ id: guild.id }));
        yield* Effect.logDebug(`Setting Autoroll for ${guild.name} to ${enabled}`);
        wrap(settings).assign({ autorollEnabled: enabled }, { mergeObjectProperties: true });
        yield* Effect.promise(() => em.flush());
      }),
    };
  }),
);
