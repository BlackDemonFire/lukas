import { readdir, readFileSync } from "fs";
import recursiveReadDir from "recursive-readdir";
import { Bot } from "./bot.js";
import logger from "./modules/logger.js";
import type { ILanguage } from "./types.js";
import { Command } from "./modules/command.js";
import type { BaseInteraction } from "discord.js";

type Constructor<T> = new (...args: unknown[]) => T;
function isCommand(t: unknown): t is Constructor<Command> {
  if (typeof t !== "function") return false;
  return t.prototype instanceof Command;
}

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
        const event = (await import(`./events/${file}`)) as { event: (...args: unknown[]) => void };
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
    void files.map(async (file: string) => {
      if (!file.endsWith(".js")) return;
      const interaction: unknown = await import(`./interactions/${file}`);
      if (typeof interaction !== "object" || !interaction || !("default" in interaction)) {
        logger.error(`Interaction file ${file} does not export a handler function`);
        return;
      }
      const interactionName = file.split(".")[0];
      logger.debug(`Loading interaction ${interactionName}`);
      client.interactions.set(
        interactionName,
        interaction.default as (client: Bot, interaction: BaseInteraction, args: string[]) => void | Promise<void>,
      );
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
        const cmd: unknown = await import(`../${file}`);
        const commandName = file.split("/").at(-1)!.split(".")[0];
        const category = file.split("/").at(-2);
        if (typeof cmd !== "object" || !cmd || !("default" in cmd)) {
          logger.error(`Command file ${file} did not provide a default export.`);
          return;
        }
        if (!isCommand(cmd.default)) {
          logger.error(`Command file ${file} did not provide a Command as default export.`);
          return;
        }
        logger.debug(`Loading command ${commandName}`);
        client.commands.set(commandName, new cmd.default(client, category, commandName));
        logger.debug(`Loaded command ${commandName}`);
        return;
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
    files
      .filter((lang) => !lang.endsWith("_schema.json"))
      .forEach((file: string) => {
        if (!file.endsWith(".json")) return;
        const lang = JSON.parse(readFileSync(`./languages/${file}`, "utf-8")) as ILanguage;
        const langName = file.split(".")[0];
        logger.debug(`Registering language ${langName}`);
        client.languages.set(langName, lang);
        logger.debug(`Registered language ${langName}`);
      });
  });
  setTimeout(
    () =>
      void Promise.all(moduleLoadPromises).then(() => {
        client.loadedAll = true;
        const listFmt = new Intl.ListFormat();
        logger.info(`loaded following events: [${listFmt.format(client.loadedEvents)}]`);
        logger.info(`loaded following languages: [${listFmt.format([...client.languages.keys()])}]`);
        logger.info(`loaded following commands: [${listFmt.format([...client.commands.keys()])}]`);
        logger.info(`loaded following interactions: [${listFmt.format([...client.interactions.keys()])}]`);
      }),
    500,
  );
  return client;
}
