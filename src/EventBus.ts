import type { Interaction, Message } from "discord.js";
import { Context, Effect, Layer, Queue, Stream } from "effect";

export type BotEvent =
  | { readonly _tag: "MessageCreate"; readonly message: Message }
  | { readonly _tag: "InteractionCreate"; readonly interaction: Interaction };

export interface IEventBus {
  publish: (event: BotEvent) => Effect.Effect<void>;
  stream: Stream.Stream<BotEvent>;
  shutdown: Effect.Effect<boolean>;
}
export const EventBus = Context.Service<IEventBus>("EventBus");
export const EventBusLive = Layer.effect(
  EventBus,
  Effect.gen(function* () {
    const queue = yield* Queue.unbounded<BotEvent>();

    return {
      publish: (event: BotEvent) => Queue.offer(queue, event).pipe(Effect.asVoid),

      // raw stream (OK internally, but we will NOT expose this widely)
      stream: Stream.fromQueue(queue),

      // optional: controlled shutdown hook
      shutdown: Queue.shutdown(queue),
    };
  }),
);
