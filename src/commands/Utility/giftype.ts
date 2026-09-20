import { sendMessage } from "@/discord/sendMessage";
import { ChannelNotSendableError } from "@/errors/ChannelNotSendable";
import { I18nService } from "@/i18n/I18n";
import { AppConfig } from "@/modules/settings";
import { GifRepository } from "@/repositories/GifRepository";
import { UserRepository } from "@/repositories/UserRepository";
import { declareCommand } from "@/types.js";
import { Message } from "discord.js";
import { Effect } from "effect";

export const GiftypeCommand = declareCommand({
  name: "giftype",
  category: "Utility",
  summary: "command.giftype.description",
  usage: Effect.gen(function* () {
    const cfg = yield* AppConfig;
    return cfg.prefix + "giftype <type>";
  }),
  run: Effect.fn("GiftypeCommand.run")(function* (message: Message, args: string[]) {
    const { channel } = message;
    if (!channel.isSendable()) {
      yield* Effect.logError(`channel ${message.channel.id} is not sendable`);
      return yield* new ChannelNotSendableError({ channelId: message.channelId });
    }
    const gifRepo = yield* GifRepository;
    const types = yield* gifRepo.getGifTypes();
    let typesstring = "";
    const i18n = yield* I18nService;
    const and = yield* i18n.t("general.and");
    switch (types.length) {
      case 1:
        typesstring = types[0]!;
        break;
      case 2:
        typesstring = types.join(` ${and} `);
        break;
      default:
        break;
    }

    const giftype: string = args.length === 0 ? "" : args[0]!.toLowerCase();
    if (args.length == 0 || !types.includes(giftype)) {
      const msg = yield* i18n.t("command.giftype.availableTypes", { types: typesstring });
      yield* sendMessage(channel, { content: msg });
      return;
    }
    const userRepo = yield* UserRepository;
    yield* userRepo.setGifType(message.author, giftype);
  }),
});
