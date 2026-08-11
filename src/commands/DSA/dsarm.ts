import { sendMessage } from "@/discord/sendMessage";
import { ChannelNotSendableError } from "@/errors/ChannelNotSendable";
import { I18nService } from "@/i18n/I18n";
import { AppConfig } from "@/modules/settings";
import { DsaCharRepository } from "@/repositories/DsaCharRepository";
import { declareCommand } from "@/types.js";
import { DiscordAPIError, Message, type OmitPartialGroupDMChannel } from "discord.js";
import { Effect } from "effect";

export const DsaRmCommand = declareCommand({
  name: "dsarm",
  summary: "command.dsarm.description",
  category: "DSA",
  usage: Effect.gen(function* () {
    const settings = yield* AppConfig;
    return `${settings.prefix}dsarm <character>`;
  }),
  run: Effect.fn("DsaRmCommand.run")(function* (message: Message, args: string[]) {
    const { channel } = message;
    if (!channel.isSendable()) {
      yield* Effect.logError(`channel ${message.channel.id} is not sendable`);
      return yield* new ChannelNotSendableError({ channelId: message.channelId });
    }
    const pref: string | undefined = args.shift()?.slice().toLowerCase();
    const i18n = yield* I18nService;
    if (!pref) {
      const argsMsg = yield* i18n.t(message.guildId, "command.dsarm.args");
      yield* Effect.tryPromise<OmitPartialGroupDMChannel<Message<boolean>>, DiscordAPIError>(() =>
        message.reply({ content: argsMsg }),
      );
      return;
    }
    const dsaCharRepo = yield* DsaCharRepository;

    if (!(yield* dsaCharRepo.getCharacter(pref))) {
      const noSuchChar = yield* i18n.t(message.guildId, "command.dsarm.noSuchChar", { pref });
      yield* sendMessage(channel, { content: noSuchChar });
      return;
    }
    yield* dsaCharRepo.deleteCharacter(pref);
    const successMsg = yield* i18n.t(message.guildId, "command.dsarm.success", { pref });
    yield* sendMessage(channel, { content: successMsg });
  }),
});
