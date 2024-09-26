import { ColorResolvable, Message, resolveColor } from "discord.js";
import { Bot } from "../../bot.js";
import { Command } from "../../modules/command.js";
import type { ILanguage as lang } from "../../types.js";
import logger from "../../modules/logger.js";
import { db } from "../../drizzle.js";
import { userdb } from "../../db/userdb.js";
import { eq } from "drizzle-orm";

export default class Addcolor extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  async run(_client: Bot, message: Message, args: string[], language: lang) {
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

    if (args && args.length > 0) {
      for (const colorString of args) {
        const color = colorString as ColorResolvable;
        try {
          resolveColor(color);
        } catch (e) {
          void e;
          await message.channel.send(language.command.color.invalid_color);
          return;
        }
        currentColors.add(color as string);
      }
    } else {
      await message.channel.send(language.command.color.invalid_color);
      return;
    }
    const colors = [...currentColors].join(";");
    await db
      .update(userdb)
      .set({ color: colors })
      .where(eq(userdb.id, message.author.id));
    await message.channel.send({ content: language.command.color.success });
  }
  help = {
    show: true,
    usage: `${this.prefix}addcolor <color> ...[color]`,
  };
}
