import type { DiscordAPIError, Webhook } from "discord.js";
import { Effect } from "effect";

export const deleteWebhook = (webhook: Webhook, reason?: string) =>
  Effect.withSpan("Discord.deleteWebhook", {
    attributes: { webhookId: webhook.id, channelId: webhook.channelId, guildId: webhook.guildId },
  })(
    Effect.tryPromise<void, DiscordAPIError>({ try: () => webhook.delete(reason), catch: (e) => e as DiscordAPIError }),
  );
