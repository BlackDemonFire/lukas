import type { DiscordAPIError, Message, OmitPartialGroupDMChannel } from "discord.js";
import { Effect } from "effect";

export const deleteMessage = (message: Message) =>
  Effect.withSpan("Discord.deleteMessage", { attributes: { messageId: message.id } })(
    Effect.tryPromise<OmitPartialGroupDMChannel<Message<boolean>>, DiscordAPIError>({
      try: () => message.delete(),
      catch: (e) => e as DiscordAPIError,
    }),
  );
