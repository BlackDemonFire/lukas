import { Bot } from "./bot";
import { start } from "./startclient.js";
import settings from "./modules/settings.js";

const client: Bot = start();

client.login(settings.TOKEN);
