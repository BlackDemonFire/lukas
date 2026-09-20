import type {
  Collection,
  DiscordAPIError,
  GuildTextBasedChannel,
  Message,
  MessageResolvable,
  PartialMessage,
  Snowflake,
} from "discord.js";
import { Effect } from "effect";

export const bulkDelete = (
  channel: GuildTextBasedChannel,
  messages: Collection<Snowflake, Message> | readonly MessageResolvable[] | number,
) =>
  Effect.withSpan("Discord.builkDelete", { attributes: { channelId: channel.id } })(
    Effect.tryPromise<Collection<Snowflake, Message | PartialMessage | undefined>, DiscordAPIError>({
      try: () => channel.bulkDelete(messages),
      catch: (e) => e as DiscordAPIError,
    }),
  );
