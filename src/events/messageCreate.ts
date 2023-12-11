import { Message } from "discord.js";
import { Bot } from "../bot.js";
import logger from "../modules/logger.js";
import settings from "../modules/settings.js";
import type { ILanguage as lang } from "../types.js";
import { CommandInput } from "../modules/command.js";

async function cmd(client: Bot, message: Message) {
  const args = message.content.slice(client.prefix.length).trim().split(" ");
  let commandname = args.shift();
  if (commandname) commandname = commandname.toLowerCase();
  if (!commandname) commandname = "";
  const command = client.commands.get(commandname);
  if (!command) return;
  if (!client.commandusage.has(message.author.id))
    client.commandusage.set(message.author.id, []);
  if (commandname == "ping") {
    const commandusage = client.commandusage.get(message.author.id)!;
    commandusage.push(message.createdTimestamp);
    client.commandusage.set(message.author.id, commandusage);
  } else {
    client.commandusage.set(message.author.id, []);
  }
  let language: lang;
  if (message.guild) {
    language = client.languages.get(await client.db.getLang(message.guild))!;
  } else {
    language = client.languages.get(settings.DEFAULTLANG)!;
  }
  logger.debug(`Running command ${commandname}`);
  await command.run(client, new CommandInput(message, null), args, language);
}

export async function event(client: Bot, message: Message) {
  try {
    if (message.author.bot) return;
    if (message.guild)
      await client.db.ensureGuildSettings(message.guild, settings.DEFAULTLANG);
    await client.db.ensureUser(message.author);
    if (message.content.startsWith(client.prefix))
      return await cmd(client, message);
  } catch (err) {
    logger.error(`A critical error occured: ${err}`);
  }
}
