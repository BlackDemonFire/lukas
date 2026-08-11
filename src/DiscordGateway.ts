import { Client, GatewayIntentBits } from "discord.js";
import { Context, Effect, Layer, Redacted } from "effect";
import { EventBus } from "./EventBus.js";
import AppConfig from "./modules/settings.js";

export const DiscordClient = Context.Service<Client>("DiscordClient");

export const DiscordLive = Layer.effect(
  DiscordClient,
  Effect.gen(function* () {
    const config = yield* AppConfig;
    const bus = yield* EventBus;
    const client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    });

    client.on("messageCreate", (msg) => {
      bus.publish({ _tag: "MessageCreate", message: msg }).pipe(Effect.runFork);
    });
    client.on("interactionCreate", (interaction) => {
      bus.publish({ _tag: "InteractionCreate", interaction }).pipe(Effect.runFork);
    });

    yield* Effect.promise(() => client.login(Redacted.value(config.TOKEN)));

    yield* Effect.logInfo("Discord connected");

    return client;
  }),
);
