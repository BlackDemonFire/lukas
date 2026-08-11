import { NodeSdk } from "@effect/opentelemetry";
import { NodeRuntime } from "@effect/platform-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { ConfigProvider, DateTime, Effect, Layer, Logger, pipe } from "effect";
import { CommandMapLive } from "./commands/index.js";
import { CommandUsageLive } from "./CommandUsage.js";
import { DatabaseLive } from "./Database.js";
import { DiscordLive } from "./DiscordGateway.js";
import { EventBusLive } from "./EventBus.js";
import { handleEvents } from "./handleEvents.js";
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

const MainLive = pipe(
  Layer.mergeAll(
    ConfigProvider.layer(ConfigProvider.fromEnv()),
    DiscordLive,
    I18nServiceLive,
    ShutdownLive,
    CommandMapLive,
    LukasRandomLive,
    CommandUsageLive,
    InteractionMapLive,
    DateTime.layerCurrentZoneNamed("Europe/London"),
    Logger.layer([Logger.consolePretty(), Logger.tracerLogger], { mergeWithExisting: false }),
    NodeSDKLive,
  ),
  Layer.provideMerge(
    Layer.mergeAll(DsaCharRepositoryLive, SettingsRepositoryLive, GifRepositoryLive, UserRepositoryLive),
  ),
  Layer.provideMerge(Layer.mergeAll(DatabaseLive, EventBusLive)),
);
const program = Effect.gen(function* () {
  yield* handleEvents;
  return yield* Effect.never;
});
pipe(program, Effect.provide(MainLive), NodeRuntime.runMain);
