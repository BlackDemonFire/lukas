import { sendMessage } from "@/discord/sendMessage";
import { I18nService } from "@/i18n/I18n";
import { AppConfig } from "@/modules/settings";
import { GifRepository } from "@/repositories/GifRepository";
import { declareCommand } from "@/types.js";
import { Message } from "discord.js";
import { Effect } from "effect";

export const GifactionsCommand = declareCommand({
  name: "gifactions",
  category: "Utility",
  summary: "command.gifactions.description",
  usage: Effect.gen(function* () {
    const cfg = yield* AppConfig;
    return cfg.prefix + "gifactions";
  }),
  run: Effect.fn("GifactionsCommand.run")(function* (message: Message, _args: string[]) {
    const { channel } = message;
    if (!channel.isSendable()) {
      yield* Effect.logError(`channel ${message.channel.id} is not sendable`);
      return;
    }
    const i18n = yield* I18nService;
    const gifRepo = yield* GifRepository;
    const actions = yield* gifRepo.getGifactions;
    let actionsstring: string = "";
    const and = yield* i18n.t(message.guildId, "general.and");
    switch (actions.length) {
      case 1:
        actionsstring = actions[0]!;
        break;
      case 2:
        actionsstring = actions.join(` ${and} `);
        break;
      default:
        actionsstring = `${actions
          .slice(0, -1)
          .map((action) => `\`${action}\``)
          .join(", ")} ${and} \`${actions.slice(-1).join(",")}\``;
        break;
    }
    const msg = yield* i18n.t(message.guildId, "command.gifactions.response", {
      actions: actionsstring,
    });
    yield* sendMessage(channel, { content: msg });
  }),
});
