import { Context, Deferred, Effect, Layer } from "effect";
import { DiscordClient } from "./Discord.js";

export const Shutdown = Context.Service<Deferred.Deferred<void>>("Shutdown");

export const ShutdownLive = Layer.effect(Shutdown, Deferred.make<void>());

export const registerShutdownSignals = Effect.gen(function* () {
  const effectContext = yield* Effect.context();

  const shutdown = yield* Shutdown;
  const client = yield* DiscordClient;

  const triggerShutdown = () => {
    // resolve shutdown signal
    Effect.runForkWith(effectContext)(
      Effect.gen(function* () {
        yield* Effect.logInfo("shutting down.");
        Deferred.doneUnsafe(shutdown, Effect.void);

        client.removeAllListeners();

        // stop gateway
        yield* Effect.promise(() => client.destroy());
      }),
    );
  };

  process.once("SIGINT", triggerShutdown);
  process.once("SIGTERM", triggerShutdown);

  yield* Effect.logInfo("Shutdown hooks registered");
});
