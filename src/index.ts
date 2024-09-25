import { Bot } from "./bot.js";
import logger from "./modules/logger.js";
import settings from "./modules/settings.js";
import { start } from "./startclient.js";

const client: Bot = start();

async function shutdown() {
  await client.destroy();
  process.exit(0);
}

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down");
  await shutdown();
});
process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down");
  await shutdown();
});
process.on("uncaughtException", logger.error.bind(logger));

client.login(settings.TOKEN).catch((err) => {
  logger.crit(`Failed to login: ${err}`);
  process.exit(1);
});
