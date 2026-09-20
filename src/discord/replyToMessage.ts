import type { DiscordAPIError, Message, MessageReplyOptions } from "discord.js";
import { Effect } from "effect";

export const replyToMessage = (message: Message, params: MessageReplyOptions) =>
  Effect.withSpan("Discord.replyToMessage", {
    attributes: { channelId: message.channelId, messageId: message.id, guildId: message.guildId },
  })(
    Effect.tryPromise<Message, DiscordAPIError>({
      try: () => message.reply(params),
      catch: (e) => e as DiscordAPIError,
    }),
  );
