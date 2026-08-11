import { Context, Effect, Layer, Option, pipe, Random, Redacted } from "effect";
import type { NoSuchElementError } from "effect/Cause";
import RandomOrg from "random-org";
import { AppConfig } from "./settings.js";

export interface IRandom {
  int: (min: number, max: number) => Effect.Effect<number>;
  ints: (min: number, max: number, count: number) => Effect.Effect<number[]>;
  choice: <T>(options: ArrayLike<T>) => Effect.Effect<T, NoSuchElementError>;
}
class FakeRandom implements IRandom {
  int(min: number, max: number) {
    return Random.nextIntBetween(min, max);
  }
  choice<T>(options: ArrayLike<T>) {
    if (!Array.isArray(options)) return Effect.succeed(options as T);
    if (options.length === 1) return Effect.succeed(options[0]!);
    return Random.choice(options as T[]);
  }
  ints(min: number, max: number, count: number) {
    return Effect.gen(function* () {
      const res = [];
      for (let i = 0; i < count; i++) {
        res.push(yield* Random.nextIntBetween(min, max));
      }
      return res;
    });
  }
}
class RandomOrgRandom implements IRandom {
  api;
  constructor(apiKey: string) {
    this.api = new RandomOrg({ apiKey });
  }
  int(min: number, max: number) {
    if (max === min) return Effect.succeed(min);
    if (min > max) {
      [max, min] = [min, max];
    }
    return pipe(
      Effect.promise(() => this.api.generateIntegers({ min: min, max: max, n: 1 })),
      Effect.map((d) => d.random.data[0]!),
    );
  }
  choice<T>(options: ArrayLike<T>) {
    if (!Array.isArray(options)) return Effect.succeed(options as T);
    if (options.length === 1) return Effect.succeed(options[0]!);
    return pipe(
      this.int(0, options.length - 1),
      Effect.map((e) => options[e]!),
    );
  }
  ints(min: number, max: number, count: number) {
    if (max == min) return Effect.succeed(Array.from<number>({ length: count }).fill(min));
    if (min > max) {
      [max, min] = [min, max];
    }
    return pipe(
      Effect.promise(() => this.api.generateIntegers({ min: min, max: max, n: count })),
      Effect.map((r) => r.random.data),
    );
  }
}
export const LukasRandom = Context.Service<IRandom>("LukasRandom");
export const LukasRandomLive = Layer.effect(
  LukasRandom,
  Effect.gen(function* () {
    const cfg = yield* AppConfig;
    yield* Effect.logInfo(
      "Running with" + Option.isSome(cfg.RANDOMKEY) ? "Random.org randomness" : "Pseudo randomness",
    );
    return Option.match(cfg.RANDOMKEY, {
      onNone: () => new FakeRandom(),
      onSome: (key) => new RandomOrgRandom(Redacted.value(key)),
    });
  }),
);
