import type { DiscordAPIError, Message, MessageCreateOptions, SendableChannels } from "discord.js";
import { Effect } from "effect";

export const sendMessage = (channel: SendableChannels, params: MessageCreateOptions) =>
  Effect.withSpan("Discord.sendMessage", {})(Effect.tryPromise<Message, DiscordAPIError>(() => channel.send(params)));
