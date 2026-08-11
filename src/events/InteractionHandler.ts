import { InteractionMap } from "@/InteractionMap";
import type { BaseInteraction } from "discord.js";
import { Effect, Schema } from "effect";

export const InteractionHandlerHandler = {
  handle: (interaction: BaseInteraction) =>
    Effect.gen(function* () {
      if (interaction.isMessageComponent()) {
        const args: string[] = interaction.customId.split(".");
        const name: string = args.shift() || "";
        const { map: interactions } = yield* InteractionMap;
        const fn = interactions.get(name);

        if (!fn) {
          const argString = Schema.toFormatter(Schema.Array(Schema.String))(args);
          yield* Effect.logWarning(`No function for requested interaction ${name} (called with args ${argString})`);
          return;
        }
        yield* fn(interaction, args);
      } else {
        yield* Effect.logWarning(`unknown interaction type`);
      }
      return;
    }),
};
