import type { DiscordAPIError, InteractionResponse, MessageComponentInteraction } from "discord.js";
import { Effect } from "effect";

export const updateInteraction = (
  interaction: MessageComponentInteraction,
  ...params: Parameters<MessageComponentInteraction["update"]>
) =>
  Effect.withSpan("Discord.updateInteraction", { attributes: { messageId: interaction.id } })(
    Effect.tryPromise<InteractionResponse, DiscordAPIError>({
      try: () => interaction.update(...params),
      catch: (e) => e as DiscordAPIError,
    }),
  );
