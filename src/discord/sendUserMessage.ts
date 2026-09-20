import type { DiscordAPIError, Message, MessageCreateOptions, User } from "discord.js";
import { Effect } from "effect";

export const sendUserMessage = (user: User, params: MessageCreateOptions) =>
  Effect.withSpan("Discord.sendUserMessage", { attributes: { userId: user.id } })(
    Effect.tryPromise<Message, DiscordAPIError>({ try: () => user.send(params), catch: (e) => e as DiscordAPIError }),
  );
