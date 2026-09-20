import type { DiscordAPIError, Message, Webhook, WebhookMessageCreateOptions } from "discord.js";
import { Effect } from "effect";

export const sendWebhookMessage = (webhook: Webhook, params: WebhookMessageCreateOptions) =>
  Effect.withSpan("Discord.sendWebhookMessage", {
    attributes: { channelId: webhook.channelId, guildId: webhook.guildId },
  })(
    Effect.tryPromise<Message, DiscordAPIError>({
      try: () => webhook.send(params),
      catch: (e) => e as DiscordAPIError,
    }),
  );
