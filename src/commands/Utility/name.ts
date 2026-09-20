import { sendMessage } from "@/discord/sendMessage";
import { ChannelNotSendableError } from "@/errors/ChannelNotSendable";
import { I18nService } from "@/i18n/I18n";
import { AppConfig } from "@/modules/settings";
import { UserRepository } from "@/repositories/UserRepository";
import { declareCommand } from "@/types.js";
import { Message } from "discord.js";
import { Effect } from "effect";

export const NameCommand = declareCommand({
  name: "name",
  category: "Utility",
  run: Effect.fn("NameCommand.run")(function* (message: Message, args: string[]) {
    const { channel } = message;
    if (!channel.isSendable()) {
      yield* Effect.logError(`channel ${message.channel.id} is not sendable`);
      return yield* new ChannelNotSendableError({ channelId: message.channelId });
    }
    let newname: string;
    if (!args || args.length === 0) {
      newname = "";
    } else {
      newname = args.join(" ");
    }
    const userRepo = yield* UserRepository;
    yield* userRepo.setName(message.author, newname);
    const i18n = yield* I18nService;
    const msg = yield* i18n.t("command.name.success", { newname });
    yield* sendMessage(channel, { content: msg });
  }),
  summary: "command.name.description",
  usage: Effect.gen(function* () {
    const config = yield* AppConfig;
    return config.prefix + "name [name]";
  }),
});
