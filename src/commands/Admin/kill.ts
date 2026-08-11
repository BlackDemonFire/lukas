import { sendMessage } from "@/discord/sendMessage";
import { ChannelNotSendableError } from "@/errors/ChannelNotSendable";
import { I18nService } from "@/i18n/I18n";
import { isOwner } from "@/modules/command";
import { AppConfig } from "@/modules/settings";
import { Shutdown } from "@/shutdown";
import { declareCommand } from "@/types.js";
import { EmbedBuilder, Message } from "discord.js";
import { Effect } from "effect";

export const KillCommand = declareCommand({
  name: "kill",
  category: "Admin",
  summary: "command.kill.description",
  usage: Effect.gen(function* () {
    const cfg = yield* AppConfig;
    return cfg.prefix + "kill";
  }),
  hidden: true,
  run: Effect.fn("KillCommand.run")(function* (message: Message, _args: string[]) {
    const { channel } = message;
    if (!channel.isSendable()) {
      yield* Effect.logError(`channel ${message.channel.id} is not sendable`);
      return yield* new ChannelNotSendableError({ channelId: message.channelId });
    }
    const i18n = yield* I18nService;
    if (!(yield* isOwner(message.author))) {
      const perm = yield* i18n.t(message.guildId, "permissions.BOT_OWNER");
      const msg = yield* i18n.t(message.guildId, "general.userPermissionError", { missingPermissions: perm });
      yield* sendMessage(channel, { content: msg });
      return;
    }
    if (message !== null) {
      const plaintext = yield* i18n.t(message.guildId, "command.kill.success");
      const embed = new EmbedBuilder()
        .setImage("https://i.imgflip.com/19f1vf.jpg")
        .setColor(0x36393e)
        .setFooter({ text: `@${message.author.username}`, iconURL: message.author.defaultAvatarURL });
      yield* sendMessage(channel, { content: plaintext, embeds: [embed] });
    }
    yield* Effect.logInfo("stopping bot...");
    yield* Shutdown;
  }),
});
