import { Bot } from "./bot.js";
import logger from "./modules/logger.js";
import settings from "./modules/settings.js";
import { start } from "./startclient.js";

const client: Bot = start();

void client.login(settings.TOKEN);

async function shutdown() {
  await client.destroy();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
process.on("uncaughtException", logger.error.bind(logger));
