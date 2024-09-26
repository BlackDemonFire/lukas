import { Message } from "discord.js";
import { Bot } from "../bot.js";
import logger from "../modules/logger.js";
import botSettings from "../modules/settings.js";
import type { ILanguage as lang } from "../types.js";
import { db } from "../drizzle.js";
import { settings } from "../db/settings.js";
import { eq } from "drizzle-orm";
import { userdb } from "../db/userdb.js";

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
  if (message.inGuild()) {
    const [guildSettings] = await db
      .select()
      .from(settings)
      .where(eq(settings.guild, message.guildId));
    language = client.languages.get(
      guildSettings?.language ?? botSettings.DEFAULTLANG,
    )!;
  } else {
    language = client.languages.get(botSettings.DEFAULTLANG)!;
  }
  logger.debug(`Running command ${commandname}`);
  const hrtime = process.hrtime();
  await command.run(client, message, args, language);
  const res = process.hrtime(hrtime);
  logger.debug(
    `Command ${commandname} took ${res[0]}s ${res[1] / 1000000}ms to run`,
  );
}

export async function event(client: Bot, message: Message) {
  try {
    if (message.author.bot) return;
    if (message.inGuild())
      await db
        .insert(settings)
        .values({ guild: message.guildId, language: botSettings.DEFAULTLANG })
        .onConflictDoNothing();
    await db
      .insert(userdb)
      .values({ id: message.author.id })
      .onConflictDoNothing();
    if (message.content.startsWith(client.prefix)) {
      await cmd(client, message);
    }
  } catch (err) {
    logger.error(`A critical error occured: ${err}`);
  }
}
