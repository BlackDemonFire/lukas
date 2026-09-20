import { NodeSdk } from "@effect/opentelemetry";
import { NodeRuntime } from "@effect/platform-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { ConfigProvider, DateTime, Effect, Layer, Logger, pipe } from "effect";
import { CommandMapLive } from "./commands/index.js";
import { CommandUsageLive } from "./CommandUsage.js";
import { DatabaseLive } from "./Database.js";
import { DiscordLive } from "./Discord.js";
import { DiscordGateway } from "./DiscordGateway.js";
import { I18nServiceLive } from "./i18n/I18n.js";
import { InteractionMapLive } from "./interactions/index.js";
import { LukasRandomLive } from "./modules/random.js";
import { DsaCharRepositoryLive } from "./repositories/DsaCharRepository.js";
import { GifRepositoryLive } from "./repositories/GifRepository.js";
import { SettingsRepositoryLive } from "./repositories/SettingsRepository.js";
import { UserRepositoryLive } from "./repositories/UserRepository.js";
import { ShutdownLive } from "./shutdown.js";

const NodeSDKLive = NodeSdk.layer(() => ({
  resource: { serviceName: "lukas" },
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
}));
const SysLayer = Layer.mergeAll(
  ConfigProvider.layer(ConfigProvider.fromEnv()),
  Logger.layer([Logger.consolePretty(), Logger.tracerLogger], { mergeWithExisting: false }),
  NodeSDKLive,
);
const Repositories = Layer.mergeAll(
  DsaCharRepositoryLive,
  SettingsRepositoryLive,
  GifRepositoryLive,
  UserRepositoryLive,
).pipe(Layer.provide(DatabaseLive));

const MainLive = pipe(
  SysLayer,
  Layer.provideMerge(DiscordLive),
  Layer.provideMerge(ShutdownLive),
  Layer.provideMerge(Layer.merge(CommandMapLive, InteractionMapLive)),
  Layer.provideMerge(DateTime.layerCurrentZoneNamed("Europe/London")),
  Layer.provideMerge(LukasRandomLive),
  Layer.provideMerge(I18nServiceLive),
  Layer.provideMerge(CommandUsageLive),
  Layer.provideMerge(Repositories),
);
const program = Effect.gen(function* () {
  yield* DiscordGateway;
  return yield* Effect.never;
});

pipe(program, Effect.provide(MainLive), NodeRuntime.runMain);
