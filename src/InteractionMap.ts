import type { BaseInteraction, CacheType, DiscordAPIError } from "discord.js";
import { Context, Effect } from "effect";
import type { GifRepository } from "./repositories/GifRepository";

export class InteractionMap extends Context.Service<
  InteractionMap,
  {
    readonly map: ReadonlyMap<
      string,
      (
        interaction: BaseInteraction<CacheType>,
        args: string[],
      ) => Effect.Effect<void, DiscordAPIError, GifRepository>
    >;
  }
>()("InteractionMap") {}
