import { readdir, readFileSync } from "fs";
import { Bot } from "./bot.js";
import logger from "./modules/logger.js";
import type { ILanguage } from "./types";

export function start() {
  const client: Bot = new Bot();
  readdir("./dist/events", (err, files) => {
    if (err) {
      logger.error(`Error while reading events:\n\t${err}`);
      return;
    }
    files.forEach(async (file: string) => {
      if (!file.endsWith(".js")) return;
      const event = await import(`./events/${file}`);
      const eventName = file.split(".")[0];
      client.on(eventName, event.event.bind(null, client));
      logger.debug(`Loaded event ${eventName}`);
    });
  });

  readdir("./dist/commands", (err, files) => {
    if (err) {
      logger.error(`Error while reading commands:\n\t${err}`);
      return;
    }
    files.forEach(async (file: string) => {
      if (!file.endsWith(".js")) return;
      const cmd = await import(`./commands/${file}`);
      const commandName = file.split(".")[0];
      client.commands.set(commandName, new cmd.default(client));
      logger.debug(`Loaded command ${commandName}`);
    });
  });

  readdir("./languages", (err, files) => {
    if (err) {
      logger.error(`Error while reading languages:\n\t${err}`);
      return;
    }
    files.forEach((file: string) => {
      if (!file.endsWith(".json")) return;
      const lang: ILanguage = JSON.parse(
        readFileSync(`./languages/${file}`, "utf-8"),
      );
      const langName = file.split(".")[0];
      client.languages.set(langName, lang);
      logger.debug(`Registered language ${langName}`);
    });
  });
  return client;
}
