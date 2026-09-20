import { sendMessage } from "@/discord/sendMessage";
import { I18nService } from "@/i18n/I18n";
import { AppConfig } from "@/modules/settings";
import { UserRepository } from "@/repositories/UserRepository";
import { declareCommand } from "@/types.js";
import { Message } from "discord.js";
import { Effect } from "effect";

export const ColorCommand = declareCommand({
  name: "color",
  category: "Utility",
  run: Effect.fn("ColorCommand.run")(function* (message: Message, _args: string[]) {
    const { channel } = message;
    if (!channel.isSendable()) {
      yield* Effect.logError(`channel ${message.channel.id} is not sendable`);
      return;
    }
    const userRepo = yield* UserRepository;
    const current_colors = new Set((yield* userRepo.getColor(message.author)).split(";"));
    const colors = [...current_colors].join(", ");
    const i18n = yield* I18nService;
    const msg = yield* i18n.t("command.color.show_colors", { c: colors });
    yield* sendMessage(channel, { content: msg });
  }),
  summary: "command.color.description",
  usage: Effect.gen(function* () {
    const cfg = yield* AppConfig;
    return cfg.prefix + "color";
  }),
});
