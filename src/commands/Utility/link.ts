import { sendMessage } from "@/discord/sendMessage";
import { DiscordClient } from "@/Discord";
import { ChannelNotSendableError } from "@/errors/ChannelNotSendable";
import { AppConfig } from "@/modules/settings";
import { declareCommand } from "@/types";
import { EmbedBuilder, Message, OAuth2Scopes, PermissionsBitField } from "discord.js";
import { Effect } from "effect";

export const LinkCommand = declareCommand({
  name: "link",
  category: "Utility",
  run: Effect.fn("LinkCommand.run")(function* (message: Message) {
    const { channel } = message;
    if (!channel.isSendable()) {
      yield* Effect.logError(`channel ${message.channel.id} is not sendable`);
      return yield* new ChannelNotSendableError({ channelId: message.channelId });
    }
    const client = yield* DiscordClient;
    const embed: EmbedBuilder = new EmbedBuilder()
      .setTitle("Links")
      .setDescription(
        `[Invite](${client.generateInvite({
          scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
          permissions: PermissionsBitField.All,
        })})\n[GitHub](https://github.com/BlackDemonFire/lukas.git)`,
      )
      .setColor(0xaa7777);
    yield* sendMessage(channel, { embeds: [embed] });
  }),
  summary: "command.link.description",
  usage: Effect.gen(function* () {
    const config = yield* AppConfig;
    return config.prefix + "link";
  }),
});
