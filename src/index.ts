import { Bot } from "./bot";
import { start } from "./startclient.js";
import settings from "./modules/settings.js";

const client: Bot = start();

client.login(settings.TOKEN);

function shutdown() {
  client.destroy();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
process.on("uncaughtException", shutdown);
