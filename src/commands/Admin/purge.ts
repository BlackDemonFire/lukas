import { sendMessage } from "@/discord/sendMessage";
import { ChannelNotSendableError } from "@/errors/ChannelNotSendable";
import { I18nService } from "@/i18n/I18n";
import { isOwner } from "@/modules/command.js";
import { AppConfig } from "@/modules/settings";
import { declareCommand } from "@/types.js";
import {
  Collection,
  DiscordAPIError,
  GuildChannel,
  Message,
  PermissionFlagsBits,
  TextChannel,
  type PartialMessage,
  type Snowflake,
} from "discord.js";
import { Effect, Schema } from "effect";

export const PurgeCommand = declareCommand({
  name: "purge",
  usage: Effect.gen(function* () {
    const settings = yield* AppConfig;
    return settings.prefix + "purge <amount>";
  }),
  category: "Admin",
  summary: "command.purge.description",
  hidden: true,
  run: Effect.fn("PurgeCommand.run")(function* (message: Message, args: string[]) {
    const { channel } = message;
    if (!channel.isSendable()) {
      yield* Effect.logError(`channel ${message.channel.id} is not sendable`);
      return yield* new ChannelNotSendableError({ channelId: message.channelId });
    }
    const i18n = yield* I18nService;
    if (!(yield* hasPermission(message))) {
      const erroredPerm = yield* i18n.t(message.guildId, "permissions.MANAGE_MESSAGES");
      const userPermissionError = yield* i18n.t(message.guildId, "general.userPermissionError", {
        missingPermissions: erroredPerm,
      });
      yield* sendMessage(channel, { content: userPermissionError });
      return;
    }
    if (!message.inGuild()) return;
    if (!message.guild.members.me!.permissionsIn(message.channel).has(PermissionFlagsBits.ManageMessages)) {
      const erroredPerm = yield* i18n.t(message.guildId, "permissions.MANAGE_MESSAGES");
      const botPermissionError = yield* i18n.t(message.guildId, "general.botPermissionError", {
        missingPermissions: erroredPerm,
      });
      yield* sendMessage(channel, { content: botPermissionError });
      return;
    }
    if (!(message.channel instanceof TextChannel)) return;
    const amount = yield* Schema.decodeEffect(Schema.FiniteFromString)(args[0] ?? "").pipe(
      Effect.tap((e) =>
        Effect.gen(function* () {
          const notNumeric = yield* i18n.t(message.guildId, "command.purge.error.notNumeric");
          yield* sendMessage(channel, { content: notNumeric });
          yield* Effect.logError(e);
        }),
      ),
    );
    yield* Effect.tryPromise<Collection<Snowflake, Message | PartialMessage | undefined>, DiscordAPIError>(() =>
      message.channel.bulkDelete(amount),
    );
  }),
});
const hasPermission = Effect.fnUntraced(function* (message: Message) {
  if (yield* isOwner(message.author)) return true;
  if (!(message.channel instanceof GuildChannel)) return false;
  if (message.member?.permissionsIn(message.channel).has(PermissionFlagsBits.ManageMessages)) return true;
  return false;
});
