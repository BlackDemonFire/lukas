import { Message } from "discord.js";
import { Bot } from "../../bot.js";
import { Command } from "../../modules/command.js";
import type { ILanguage as lang } from "../../types.js";
import logger from "../../modules/logger.js";
import { db } from "../../drizzle.js";
import { userdb } from "../../db/userdb.js";
import { eq } from "drizzle-orm";

export default class Color extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  async run(_client: Bot, message: Message, _args: string[], language: lang) {
    if (!message.channel.isSendable()) {
      logger.error(`channel ${message.channel.id} is not sendable`);
      return;
    }
    const currentColors = new Set(
      (
        await db
          .select({ color: userdb.color })
          .from(userdb)
          .where(eq(userdb.id, message.author.id))
      )[0]?.color?.split(";") ?? [],
    );
    const colors = [...currentColors].join(", ");
    await message.channel.send({
      content: language.command.color.show_colors.replace("{c}", colors),
    });
  }
  help = {
    show: true,
    usage: `${this.prefix}color`,
  };
}
