import type { Bot } from "@/bot.js";
import logger from "@/modules/logger.js";
import { event as handleReady } from "./clientReady.js";
import { event as handleInteractionCreate } from "./interactionCreate.js";
import { event as handleMessageCreate } from "./messageCreate.js";

export function loadEvents(client: Bot) {
  logger.debug("Listening to event 'ready'");
  client.on("clientReady", () => void handleReady(client));
  logger.debug("Listening to event 'interactionCreate'");
  client.on("interactionCreate", (interaction) => void handleInteractionCreate(client, interaction));
  logger.debug("Listening to event 'messageCreate'");
  client.on("messageCreate", (message) => void handleMessageCreate(client, message));
}
