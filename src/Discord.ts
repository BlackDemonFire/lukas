import { Client, GatewayIntentBits } from "discord.js";
import { Context, Effect, Layer, Redacted } from "effect";
import AppConfig from "./modules/settings.js";

export const DiscordClient = Context.Service<Client>("DiscordClient");

export const DiscordLive = Layer.effect(
  DiscordClient,
  Effect.gen(function* () {
    const config = yield* AppConfig;
    const client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    });

    yield* Effect.promise(() => client.login(Redacted.value(config.TOKEN)));

    yield* Effect.logInfo("Discord connected");

    return client;
  }),
);
