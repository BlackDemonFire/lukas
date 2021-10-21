import { Bot } from "./bot";
import { start } from "./startclient.js";

const client: Bot = start();

client.login(process.env.TOKEN);