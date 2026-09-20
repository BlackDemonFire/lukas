import { sendMessage } from "@/discord/sendMessage";
import { ChannelNotSendableError } from "@/errors/ChannelNotSendable";
import { I18nService } from "@/i18n/I18n";
import { AppConfig } from "@/modules/settings";
import { DsaCharRepository } from "@/repositories/DsaCharRepository";
import { declareCommand } from "@/types";
import { Message } from "discord.js";
import { Effect } from "effect";

export const DsaAddCommand = declareCommand({
  usage: Effect.gen(function* () {
    const settings = yield* AppConfig;
    return `${settings.prefix}dsaadd <character> [avatar - if it doesn't start with \`http\`, it will be ignored.] <displayed name>`;
  }),
  category: "DSA",
  name: "dsaadd",
  summary: "command.dsaadd.description",
  run: Effect.fn("DsaaddCommand.run")(function* (message: Message, args: string[]) {
    const channel = message.channel;
    if (!channel.isSendable()) {
      yield* Effect.logError(`channel ${message.channel.id} is not sendable`);
      return yield* new ChannelNotSendableError({ channelId: message.channelId });
    }
    const i18n = yield* I18nService;
    if (!args || args.length <= 3) {
      const msg = yield* i18n.t("command.dsaadd.args");
      yield* sendMessage(channel, { content: msg });
      return;
    }
    const pref: string = args.shift()!.slice().toLowerCase();
    const img: string = args[0]?.includes("http") ? args.shift()! : "";
    const name: string = args.join(" ");
    const dsaCharRepo = yield* DsaCharRepository;
    yield* dsaCharRepo.createCharacter(pref, name, img);
    const msg = yield* i18n.t("command.dsaadd.success", { pref });
    yield* sendMessage(channel, { content: msg });
  }),
});
