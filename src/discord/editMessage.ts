import type { DiscordAPIError, Message } from "discord.js";
import { Effect } from "effect";

export const editMessage = (message: Message, ...params: Parameters<Message["edit"]>) =>
  Effect.withSpan("Discord.editMessage", { attributes: { messageId: message.id } })(
    Effect.tryPromise<Message, DiscordAPIError>({
      try: () => message.edit(...params),
      catch: (e) => e as DiscordAPIError,
    }),
  );
