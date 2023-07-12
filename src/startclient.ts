import { readdir, readFileSync } from "fs";
import { Bot } from "./bot.js";
import logger from "./modules/logger.js";
import type { ILanguage } from "./types";

export function start() {
  const client: Bot = new Bot();
  const moduleLoadPromises: Promise<void>[] = [];

  readdir("./dist/events", (err, files) => {
    if (err) {
      logger.error(`Error while reading events:\n\t${err}`);
      return;
    }
    files
      .map(async (file: string) => {
        if (!file.endsWith(".js")) return;
        const event = await import(`./events/${file}`);
        const eventName = file.split(".")[0];
        logger.debug(`Loading event ${eventName}`);
        client.on(eventName, event.event.bind(null, client));
        client.loadedEvents.push(eventName);
        logger.debug(`Loaded event ${eventName}`);
      })
      .forEach((p) => moduleLoadPromises.push(p));
  });

  readdir("./dist/commands", (err, files) => {
    if (err) {
      logger.error(`Error while reading commands:\n\t${err}`);
      return;
    }
    files
      .map(async (file: string) => {
        if (!file.endsWith(".js")) return;
        const cmd = await import(`./commands/${file}`);
        const commandName = file.split(".")[0];
        logger.debug(`Loading command ${commandName}`);
        client.commands.set(commandName, new cmd.default(client));
        logger.debug(`Loaded command ${commandName}`);
      })
      .forEach((p) => {
        moduleLoadPromises.push(p);
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
      logger.debug(`Registering language ${langName}`);
      client.languages.set(langName, lang);
      logger.debug(`Registered language ${langName}`);
    });
  });
  logger.info(moduleLoadPromises.length);
  setTimeout(
    () =>
      Promise.all(moduleLoadPromises).then(() => {
        client.loadedAll = true;
        logger.info(`loaded following events: [${client.loadedEvents}]`);
        logger.info(
          `loaded following languages: [${[...client.languages.keys()]}]`,
        );
        logger.info(
          `loaded following commands: [${[...client.commands.keys()]}]`,
        );
      }),
    500,
  );
  return client;
}
