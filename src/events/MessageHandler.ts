import type { Message } from "discord.js";
import { Clock, Duration, Effect } from "effect";

import { CommandMap } from "@/CommandMap";
import { CurrentLanguage } from "@/i18n/CurrentLanguage";
import { executeRollIfEnabled } from "@/modules/rollHandler";
import { AppConfig } from "@/modules/settings.js";
import { SettingsRepository } from "@/repositories/SettingsRepository.js";
import { UserRepository } from "@/repositories/UserRepository.js";

const executeCommand = Effect.fn("executeCommand")(function* (message: Message) {
  const settings = yield* AppConfig;
  const args = message.content.slice(settings.prefix.length).trim().split(" ");
  let commandname = args.shift();
  if (commandname) commandname = commandname.toLowerCase();
  if (!commandname) commandname = "";
  const { map: commands } = yield* CommandMap;
  const command = commands.get(commandname);
  if (!command) return;

  yield* Effect.logInfo(`Running command ${commandname}`);
  const clock = yield* Clock.Clock;
  const start = yield* clock.currentTimeMillis;
  yield* command.run(message, args);
  const end = yield* clock.currentTimeMillis;
  const dur = Duration.millis(end - start);
  yield* Effect.logInfo("Command executed in", Duration.format(dur));
});

export const MessageHandler = {
  handle: (message: Message) =>
    Effect.gen(function* () {
      if (message.author.bot) {
        if (message.author.id === message.client.user.id) yield* Effect.annotateCurrentSpan("self", true);
        return;
      }
      const cfg = yield* AppConfig;
      const settingsRepo = yield* SettingsRepository;
      if (message.guild) yield* settingsRepo.ensureGuildSettings(message.guild, cfg.defaultLanguage);
      const userRepo = yield* UserRepository;
      yield* userRepo.ensureUser(message.author);
      const lang = message.inGuild() ? yield* settingsRepo.getLang(message.guildId) : cfg.defaultLanguage;
      return yield* Effect.provideService(
        Effect.gen(function* () {
          if (message.content.startsWith(cfg.prefix)) return yield* executeCommand(message);

          if (!message.inGuild()) return;
          if (yield* executeRollIfEnabled(message)) return;

          yield* Effect.logWarning(`Unhandled message by ${message.author.id}: ${message.id}`);
        }),
        CurrentLanguage,
        lang,
      );
    }),
};
