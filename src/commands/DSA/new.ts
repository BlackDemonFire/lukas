import { sendMessage } from "@/discord/sendMessage";
import { ChannelNotSendableError } from "@/errors/ChannelNotSendable";
import type { CurrentLanguage } from "@/i18n/CurrentLanguage";
import { I18nService } from "@/i18n/I18n";
import { AppConfig } from "@/modules/settings";
import { DsaCharRepository } from "@/repositories/DsaCharRepository";
import { declareCommand } from "@/types.js";
import { Message, MessageCollector } from "discord.js";
import { Effect, pipe } from "effect";

export const NewCommand = declareCommand({
  name: "new",
  summary: "command.new.description",
  category: "DSA",
  usage: Effect.gen(function* () {
    const settings = yield* AppConfig;
    return `${settings.prefix}new`;
  }),
  run: Effect.fn("NewCommand.run")(function* (message: Message, _args: string[]) {
    const { channel } = message;
    if (!channel.isSendable()) {
      yield* Effect.logError(`channel ${message.channel.id} is not sendable`);
      return yield* new ChannelNotSendableError({ channelId: message.channelId });
    }
    let i = 0;
    let av: string;
    let pref: string;
    const i18n = yield* I18nService;
    const getPrefix = yield* i18n.t("command.new.getPrefix");
    yield* sendMessage(channel, { content: getPrefix });
    const collector = new MessageCollector(channel, {
      filter: (m: Message) => m.author.id === message.author.id,
      time: 50000,
    });
    const timeoutMsg = yield* i18n.t("general.timeout");
    const effectContext = yield* Effect.context<DsaCharRepository | CurrentLanguage>();
    collector.on("end", (msgs) =>
      pipe(
        Effect.gen(function* () {
          if (msgs.size == 0) {
            yield* sendMessage(channel, { content: timeoutMsg });
          }
        }),
        Effect.runForkWith(effectContext),
      ),
    );

    collector.on("collect", (msg) =>
      Effect.runForkWith(effectContext)(
        Effect.gen(function* () {
          if (i > 2) {
            collector.stop();
          } else {
            i += 1;
          }
          switch (i) {
            case 1: {
              pref = msg.content.toLowerCase().split(" ")[0]!;
              const getAvatarMessage = yield* i18n.t("command.new.getAvatar");
              yield* sendMessage(channel, { content: getAvatarMessage });
              if (!pref.startsWith("$")) pref = `$${pref}`;
              break;
            }
            case 2: {
              av = msg.content === "n" ? "" : msg.content;

              const getNameMsg = yield* i18n.t("command.new.getName");
              yield* sendMessage(channel, { content: getNameMsg });
              break;
            }
            case 3:
              {
                const name = msg.content;
                collector.stop();
                const successMsg = yield* i18n.t("command.new.success", { name, pref });
                yield* sendMessage(channel, { content: successMsg });
                const dsaCharRepo = yield* DsaCharRepository;
                yield* dsaCharRepo.createCharacter(pref, name, av);
              }
              break;
          }
        }),
      ),
    );
  }),
});
