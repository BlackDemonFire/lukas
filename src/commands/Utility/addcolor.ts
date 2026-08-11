import { sendMessage } from "@/discord/sendMessage";
import { ChannelNotSendableError } from "@/errors/ChannelNotSendable";
import { I18nService } from "@/i18n/I18n";
import { AppConfig } from "@/modules/settings";
import { UserRepository } from "@/repositories/UserRepository";
import { declareCommand } from "@/types.js";
import {
  type ColorResolvable,
  DiscordjsRangeError,
  DiscordjsTypeError,
  Message,
  resolveColor,
} from "discord.js";
import { Effect } from "effect";

export const AddcolorCommand = declareCommand({
  name: "addcolor",
  run: Effect.fn("AddcolorCommand.run")(function* (message: Message, args: string[]) {
    const { channel } = message;
    if (!channel.isSendable()) {
      yield* Effect.logError(`channel ${message.channel.id} is not sendable`);
      return yield* new ChannelNotSendableError({ channelId: message.channelId });
    }
    const userRepo = yield* UserRepository;
    const current_colors = new Set((yield* userRepo.getColor(message.author)).split(";"));
    const i18n = yield* I18nService;

    if (args && args.length > 0) {
      for (const color_string of args) {
        const color = color_string as Exclude<
          ColorResolvable,
          number | readonly [number, number, number]
        >;
        yield* Effect.try<number, DiscordjsTypeError | DiscordjsRangeError>(() =>
          resolveColor(color),
        ).pipe(
          Effect.tapError(() =>
            Effect.gen(function* () {
              const msg = yield* i18n.t(message.guildId, "command.color.invalid_color");
              yield* sendMessage(channel, { content: msg });
            }),
          ),
        );

        current_colors.add(color);
      }
    } else {
      const msg = yield* i18n.t(message.guildId, "command.color.invalid_color");
      yield* sendMessage(channel, { content: msg });
      return;
    }
    const colors = [...current_colors].join(";");
    yield* userRepo.setColor(message.author, colors);
    const msg = yield* i18n.t(message.guildId, "command.color.success");
    yield* sendMessage(channel, { content: msg });
  }),
  usage: Effect.gen(function* () {
    const cfg = yield* AppConfig;
    return `${cfg.prefix}addcolor <color> ...[color]`;
  }),
  category: "Utility",
  summary: "command.addcolor.description",
});
