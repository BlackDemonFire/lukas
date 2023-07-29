import { readdir, readFileSync } from "fs";
import recursiveReadDir from "recursive-readdir";
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

  readdir("./dist/interactions", (err, files) => {
    if (err) {
      logger.error(`Error while reading interactions:\n\t${err}`);
      return;
    }
    files.map(async (file: string) => {
      if (!file.endsWith(".js")) return;
      const interaction = await import(`./interactions/${file}`);
      const interactionName = file.split(".")[0];
      logger.debug(`Loading interaction ${interactionName}`);
      client.interactions.set(interactionName, interaction.default);
      logger.debug(`Loaded interaction ${interactionName}`);
    });
  });

  recursiveReadDir("./dist/commands", function (err, files) {
    if (err) {
      logger.error(`Error while reading commands:\n\t${err}`);
      return;
    }

    files
      .filter((file) => file.endsWith(".js"))
      .map(async (file: string) => {
        const cmd = await import(`../${file}`);
        const commandName = file.split("/").at(-1)!.split(".")[0];
        const category = file.split("/").at(-2);
        logger.debug(`Loading command ${commandName}`);
        client.commands.set(
          commandName,
          new cmd.default(client, category, commandName),
        );
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
        logger.info(
          `loaded following interactions: [${[...client.interactions.keys()]}]`,
        );
      }),
    500,
  );
  return client;
}
