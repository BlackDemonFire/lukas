import { Effect } from "effect";
import type { Services } from "effect/Effect";
import { DiscordClient } from "./Discord";
import { InteractionHandler } from "./events/InteractionHandler";
import { MessageHandler } from "./events/MessageHandler";

export const DiscordGateway = Effect.scoped(
  Effect.gen(function* () {
    const client = yield* DiscordClient;
    type Requirements =
      | Services<ReturnType<typeof MessageHandler.handle>>
      | Services<ReturnType<typeof InteractionHandler.handle>>;
    const ctx = yield* Effect.context<Requirements>();
    const runEvent = <A, E>(
      name: string,
      effect: Effect.Effect<A, E, Requirements>,
      attributes?: Record<string, unknown>,
    ) =>
      Effect.runForkWith(ctx)(
        effect.pipe(
          Effect.withSpan(`discord.${name}`, { attributes, root: true }),
          Effect.catchCause((cause) => Effect.logError(`Discord ${name} failed`, cause)),
        ),
      );
    client.on("messageCreate", (message) =>
      runEvent("message", MessageHandler.handle(message), {
        messageId: message.id,
        authorId: message.author.id,
        guildId: message.guildId,
        channelId: message.channelId,
      }),
    );
    client.on("interactionCreate", (interaction) =>
      runEvent("interaction", InteractionHandler.handle(interaction), {
        interactionId: interaction.id,
        channelId: interaction.channelId,
        guildId: interaction.guildId,
        userId: interaction.user.id,
        interactionType: interaction.type,
      }),
    );
    yield* Effect.logInfo("Discord event listeners registered");
  }),
);
