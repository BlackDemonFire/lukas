import { Message } from "discord.js";
import { Bot } from "../../bot.js";
import { Command } from "../../modules/command.js";
import type { ILanguage as lang } from "../../types.js";
import logger from "../../modules/logger.js";
import { db } from "../../drizzle.js";
import { dsachars } from "../../db/dsachars.js";
import { eq } from "drizzle-orm";

export default class Dsarm extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  help = {
    show: true,
    usage: `${this.prefix}dsarm <character>`,
  };
  async run(_client: Bot, message: Message, args: string[], language: lang) {
    if (!message.channel.isSendable()) {
      logger.error(`channel ${message.channel.id} is not sendable`);
      return;
    }
    const pref: string | undefined = args.shift()?.slice().toLowerCase();
    if (!pref) {
      await message.reply({ content: language.command.dsarm.args });
      return;
    }
    const [existingCharacter] = await db
      .select()
      .from(dsachars)
      .where(eq(dsachars.prefix, pref));
    if (!existingCharacter) {
      await message.channel.send({
        content: language.command.dsarm.noSuchChar.replace("{pref}", pref),
      });
      return;
    }
    await db.delete(dsachars).where(eq(dsachars.prefix, pref));
    await message.channel.send({
      content: language.command.dsarm.success.replace("{pref}", pref),
    });
  }
}
