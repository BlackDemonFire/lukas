import { Deferred, Effect, Match, Stream } from "effect";
import { EventBus } from "./EventBus.js";
import { InteractionHandlerHandler } from "./events/InteractionHandler.js";
import { MessageHandler } from "./events/MessageHandler.js";
import { Shutdown } from "./shutdown.js";

export const handleEvents = Effect.gen(function* () {
  const queue = yield* EventBus;
  const shutdown = yield* Shutdown;

  yield* Stream.runForEach(queue.stream, (msg) =>
    Match.value(msg).pipe(
      Match.tag("MessageCreate", (m) => MessageHandler.handle(m.message)),
      Match.tag("InteractionCreate", (m) => InteractionHandlerHandler.handle(m.interaction)),
      Match.exhaustive,
    ),
  ).pipe(Effect.raceFirst(Deferred.await(shutdown)));
});
