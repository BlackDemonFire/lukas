import { ColorResolvable, Message, resolveColor } from "discord.js";
import { Bot } from "../../bot.js";
import { Command } from "../../modules/command.js";
import type { ILanguage } from "../../types.js";
import logger from "../../modules/logger.js";

export default class Setcolor extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  async run(
    client: Bot,
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
      for (const color_string of args) {
        const color = color_string as ColorResolvable;
        try {
          resolveColor(color);
        } catch (e) {
          await message.channel.send(language.command.color.invalid_color);
          return;
        }
        colors += `;${color}`;
      }
      colors = colors.substring(1);
    } else {
      colors = "Random";
    }
    await client.db.setColor(message.author, colors);
    await message.channel.send({ content: language.command.color.success });
  }
  help = {
    show: true,
    usage: `${this.prefix}setcolor [color]`,
  };
}
