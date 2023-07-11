import { readdir, readFileSync } from "fs";
import { Bot } from "./bot.js";
import logger from "./modules/logger.js";
import type { language } from "./types";

export function start() {
  const client: Bot = new Bot();
  readdir("./dist/events", (err, files) => {
    if (err) {
      logger.error(err);
      return;
    }
    files.forEach(async (file: string) => {
      if (!file.endsWith(".js")) return;
      const event = await import(`./events/${file}`);
      const eventName = file.split(".")[0];
      client.on(eventName, event.event.bind(null, client));
    });
  });

  readdir("./dist/commands", (err, files) => {
    if (err) {
      logger.error(err);
      return;
    }
    files.forEach(async (file: string) => {
      if (!file.endsWith(".js")) return;
      const cmd = await import(`./commands/${file}`);
      const commandName = file.split(".")[0];
      logger.info(`Attempting to load command ${commandName}`);
      client.commands.set(commandName, new cmd.default(client));
    });
  });

  readdir("./languages", (err, files) => {
    if (err) {
      logger.error(err);
      return;
    }
    files.forEach((file: string) => {
      if (!file.endsWith(".json")) return;
      const lang: language = JSON.parse(
        readFileSync(`./languages/${file}`, "utf-8"),
      );
      const langName = file.split(".")[0];
      logger.info(`Registering Language ${langName}`);
      client.languages.set(langName, lang);
    });
  });
  return client;
}
