import type { DiscordAPIError, Message, MessageCreateOptions, SendableChannels } from "discord.js";
import { Effect } from "effect";

export const sendMessage = (channel: SendableChannels, params: MessageCreateOptions) =>
  Effect.withSpan("Discord.sendMessage", { attributes: { channelId: channel.id } })(
    Effect.tryPromise<Message, DiscordAPIError>({
      try: () => channel.send(params),
      catch: (e) => e as DiscordAPIError,
    }),
  );
