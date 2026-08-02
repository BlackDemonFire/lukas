import { readdir, readFileSync } from "node:fs";
import { Bot } from "./bot.js";
import { allCommands } from "./commands/index.js";
import { loadEvents } from "./events/index.js";
import { interactions } from "./interactions/index.js";
import { Command } from "./modules/command.js";
import logger from "./modules/logger.js";
import type { ILanguage } from "./types.js";

type Constructor<T> = new (...args: unknown[]) => T;
function isCommand(t: unknown): t is Constructor<Command> {
  if (typeof t !== "function") return false;
  return t.prototype instanceof Command;
}

export function start() {
  const client: Bot = new Bot();
  const moduleLoadPromises: Promise<void>[] = [];

  loadEvents(client);

  interactions.forEach((interaction) => {
    logger.debug(`Loading interaction ${interaction.name}`);
    client.interactions.set(interaction.name, interaction.run);
    logger.debug(`Loaded interaction ${interaction.name}`);
  });

  allCommands.forEach((command) => {
    if (!isCommand(command)) {
      logger.error(`Command ${command.name} does not appear to be a command.`);
      return;
    }
    logger.debug(`Loading command ${command.name}`);
    const instance = new command(client);
    client.commands.set(instance.name, instance);
    logger.debug(`Loaded command ${command.name} as ${instance.name}`);
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
        const langName = file.split(".")[0]!;
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
        logger.info(`loaded following languages: [${listFmt.format([...client.languages.keys()])}]`);
        logger.info(`loaded following commands: [${listFmt.format([...client.commands.keys()])}]`);
        logger.info(`loaded following interactions: [${listFmt.format([...client.interactions.keys()])}]`);
      }),
    500,
  );
  return client;
}
