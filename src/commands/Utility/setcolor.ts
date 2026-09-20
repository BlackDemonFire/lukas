import { resolveColor } from "@/discord/resolveColor";
import { sendMessage } from "@/discord/sendMessage";
import { ChannelNotSendableError } from "@/errors/ChannelNotSendable";
import { I18nService } from "@/i18n/I18n";
import { AppConfig } from "@/modules/settings";
import { UserRepository } from "@/repositories/UserRepository";
import { declareCommand } from "@/types.js";
import { type ColorResolvable, Message } from "discord.js";
import { Effect } from "effect";

export const SetcolorCommand = declareCommand({
  name: "setcolor",
  category: "Utility",
  run: Effect.fn("SetcolorCommand.run")(function* (message: Message, args: string[]) {
    const channel = message.channel;
    if (!channel.isSendable()) {
      yield* Effect.logError(`channel ${channel.id} is not sendable`);
      return yield* new ChannelNotSendableError({ channelId: message.channelId });
    }
    let colors: string = "";
    const i18n = yield* I18nService;
    if (args && args.length > 0) {
      for (const color_string of args) {
        const color = color_string as ColorResolvable;
        yield* resolveColor(color).pipe(
          Effect.tapError(() =>
            Effect.gen(function* () {
              const msg = yield* i18n.t("command.color.invalid_color");
              yield* sendMessage(channel, { content: msg });
            }),
          ),
        );
        colors += `;${color.toString()}`;
      }
      colors = colors.substring(1);
    } else {
      colors = "Random";
    }
    const userRepo = yield* UserRepository;
    yield* userRepo.setColor(message.author, colors);
    const content = yield* i18n.t("command.color.success");
    yield* sendMessage(channel, { content });
  }),
  summary: "command.setcolor.description",
  usage: Effect.gen(function* () {
    const cfg = yield* AppConfig;
    return cfg.prefix + "setcolor [color]";
  }),
});
