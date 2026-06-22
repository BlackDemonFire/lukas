import { Bot } from "./bot.js";
import logger from "./modules/logger.js";
import settings from "./modules/settings.js";
import { start } from "./startclient.js";

const client: Bot = start();

async function shutdown() {
  await client.destroy();
  process.exit(0);
}

// eslint-disable-next-line @typescript-eslint/no-misused-promises
process.on("SIGTERM", shutdown);
// eslint-disable-next-line @typescript-eslint/no-misused-promises
process.on("SIGINT", shutdown);
process.on("uncaughtException", (ex) => {
  logger.error("Uncaught exception", ex);
});

await client.login(settings.TOKEN);
