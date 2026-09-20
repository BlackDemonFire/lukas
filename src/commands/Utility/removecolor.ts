import { resolveColor } from "@/discord/resolveColor";
import { sendMessage } from "@/discord/sendMessage";
import { ChannelNotSendableError } from "@/errors/ChannelNotSendable";
import { I18nService } from "@/i18n/I18n";
import { AppConfig } from "@/modules/settings";
import { UserRepository } from "@/repositories/UserRepository";
import { declareCommand } from "@/types.js";
import { type ColorResolvable, Message } from "discord.js";
import { Effect } from "effect";

export const RemoveColorCommand = declareCommand({
  name: "removecolor",
  category: "Utility",
  run: Effect.fn("RemoveColorCommand.run")(function* (message: Message, args: string[]) {
    const { channel } = message;
    if (!channel.isSendable()) {
      yield* Effect.logError(`channel ${message.channel.id} is not sendable`);
      return yield* new ChannelNotSendableError({ channelId: message.channelId });
    }
    const userRepo = yield* UserRepository;

    const dbColor = yield* userRepo.getColor(message.author);
    const current_colors = new Set(dbColor.split(";"));
    const i18n = yield* I18nService;
    if (args && args.length > 0) {
      for (const color_string of args) {
        const color = color_string as Exclude<ColorResolvable, number | readonly [number, number, number]>;
        yield* resolveColor(color).pipe(
          Effect.tapError(() =>
            Effect.gen(function* () {
              const msg = yield* i18n.t("command.color.invalid_color");
              yield* sendMessage(channel, { content: msg });
            }),
          ),
        );
        yield* Effect.logDebug([...current_colors].join(" "));
        yield* Effect.logDebug(color_string);
        yield* Effect.logDebug(color_string in current_colors);
        const found = current_colors.delete(color_string);
        yield* Effect.logDebug(`Color ${color.toString()} was ${found ? "" : "not"} removed`);
      }
    } else {
      const msg = yield* i18n.t("command.color.invalid_color");
      yield* sendMessage(channel, { content: msg });
      return;
    }
    const colors = [...current_colors].join(";");
    yield* userRepo.setColor(message.author, colors);
    const msg = yield* i18n.t("command.color.success");
    yield* sendMessage(channel, { content: msg });
  }),
  summary: "command.removecolor.description",
  usage: Effect.gen(function* () {
    const settings = yield* AppConfig;
    return `${settings.prefix}removecolor <color> ...[color]`;
  }),
});
