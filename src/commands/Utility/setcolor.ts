import { ColorResolvable, Message, resolveColor } from "discord.js";
import { eq } from "drizzle-orm";
import { Bot } from "../../bot.js";
import { userdb } from "../../db/userdb.js";
import { db } from "../../drizzle.js";
import { Command } from "../../modules/command.js";
import logger from "../../modules/logger.js";
import type { ILanguage } from "../../types.js";

export default class Setcolor extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  async run(
    _client: Bot,
    message: Message,
    args: string[],
    language: ILanguage,
  ) {
    if (!message.channel.isSendable()) {
      logger.error(`channel ${message.channel.id} is not sendable`);
      return;
    }
    let colors: string = "";
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
        colors += `;${color}`;
      }
      colors = colors.substring(1);
    } else {
      colors = "Random";
    }
    await db
      .update(userdb)
      .set({ color: colors })
      .where(eq(userdb.id, message.author.id));
    await message.channel.send({ content: language.command.color.success });
  }
  help = {
    show: true,
    usage: `${this.prefix}setcolor [color]`,
  };
}
