import { Clock, Context, Duration, Effect, Layer, Ref } from "effect";

type UsageMap = Map<string, readonly number[]>;

interface ICommandUsage {
  recordAndTest: (key: string, limit: number, window: Duration.Duration) => Effect.Effect<boolean, never, never>;
}
export class CommandUsage extends Context.Service<CommandUsage, ICommandUsage>()("CommandUsage") {}

export const CommandUsageLive = Layer.effect(
  CommandUsage,
  Effect.gen(function* () {
    const state = yield* Ref.make<UsageMap>(new Map());

    return {
      recordAndTest: (key: string, limit: number, window: Duration.Duration) =>
        Effect.gen(function* () {
          const now = yield* Clock.currentTimeMillis;

          return yield* Ref.modify(state, (map) => {
            const cutoff = now - Duration.toMillis(window);

            const timestamps = (map.get(key) ?? []).filter((t) => t >= cutoff);

            const updated = [...timestamps, now];

            const next = new Map(map);
            next.set(key, updated);

            return [updated.length >= limit, next] as const;
          });
        }),
    };
  }),
);
