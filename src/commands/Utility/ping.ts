import { CommandUsage } from "@/CommandUsage";
import { sendMessage } from "@/discord/sendMessage";
import { DiscordClient } from "@/DiscordGateway";
import { ChannelNotSendableError } from "@/errors/ChannelNotSendable";
import { I18nService } from "@/i18n/I18n";
import { isAprilFools } from "@/modules/command.js";
import { AppConfig } from "@/modules/settings";
import { declareCommand } from "@/types.js";
import { DiscordAPIError, EmbedBuilder, Message } from "discord.js";
import { Duration, Effect } from "effect";

export const PingCommand = declareCommand({
  name: "ping",
  category: "Utility",
  summary: "command.ping.description",
  usage: Effect.gen(function* () {
    const settings = yield* AppConfig;
    return settings.prefix + "ping";
  }),
  run: Effect.fn("PingCommand.run")(function* (message: Message, _args: string[]) {
    const { channel } = message;
    if (!channel.isSendable()) {
      yield* Effect.logError(`channel ${message.channel.id} is not sendable`);
      return yield* new ChannelNotSendableError({ channelId: message.channelId });
    }
    const commandusage = yield* CommandUsage;
    const gif = yield* commandusage.recordAndTest("ping|" + message.author.id, 3, Duration.minutes(10));
    // code

    if (yield* isAprilFools) {
      yield* runAprilFools(message);
      return;
    }
    const msg = yield* sendMessage(channel, { content: "<a:load_1:498280749271744512> Ping?" }).pipe(
      Effect.tapError((e) => Effect.logError(e)),
      Effect.catch((_) => Effect.void),
    );
    if (!msg) return;
    const client = yield* DiscordClient;
    const i18n = yield* I18nService;
    const apiLatency = yield* i18n.t(message.guildId, "command.ping.apiLatency", {
      latency: Math.round(client.ws.ping),
    });
    const latency = yield* i18n.t(message.guildId, "command.ping.latency", {
      latency: msg.createdTimestamp - message.createdTimestamp,
    });
    const embed = new EmbedBuilder()
      .setColor(0x7289da)
      .setDescription(apiLatency)
      .setAuthor({ name: latency })
      .setFooter({ text: `@${message.author.username}` });
    if (gif) embed.setImage("https://cdn.discordapp.com/attachments/605382573413236758/744671452267282472/Alert.gif");
    yield* Effect.tryPromise<Message, DiscordAPIError>(() =>
      msg.edit({ content: "<:check_4:498523284804075541> Pong!", embeds: [embed] }),
    );
  }),
});
const runAprilFools = Effect.fn("PingCommand.aprilFools")(function* (message: Message<boolean>) {
  const { channel } = message;
  if (!channel.isSendable()) {
    yield* Effect.logError(`channel ${message.channel.id} is not sendable`);
    return yield* new ChannelNotSendableError({ channelId: message.channelId });
  }
  const embed = new EmbedBuilder()
    .setColor(0x7289da)
    .setDescription(message.author.toString())
    .setAuthor({ name: `Ping: @${message.member ? message.member.displayName : message.author.username}` })
    .setFooter({
      text: `@${message.member ? message.member.displayName : message.author.username}`,
      iconURL: message.author.defaultAvatarURL,
    });
  return yield* sendMessage(channel, { content: message.author.toString(), embeds: [embed] });
});
