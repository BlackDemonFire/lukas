import { ColorResolvable, Message, resolveColor } from "discord.js";
import { Bot } from "../../bot.js";
import { Command } from "../../modules/command.js";
import type { ILanguage as lang } from "../../types.js";
import logger from "../../modules/logger.js";

export default class Addcolor extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  async run(client: Bot, message: Message, args: string[], language: lang) {
    if (!message.channel.isSendable()) {
      logger.error(`channel ${message.channel.id} is not sendable`);
      return;
    }
    const current_colors = new Set(
      (await client.db.getColor(message.author)).split(";"),
    );

    if (args && args.length > 0) {
      for (const color_string of args) {
        const color = color_string as ColorResolvable;
        try {
          resolveColor(color);
        } catch (e) {
          await message.channel.send(language.command.color.invalid_color);
          return;
        }
        current_colors.add(color as string);
      }
    } else {
      await message.channel.send(language.command.color.invalid_color);
      return;
    }
    const colors = [...current_colors].join(";");
    await client.db.setColor(message.author, colors);
    await message.channel.send({ content: language.command.color.success });
  }
  help = {
    show: true,
    usage: `${this.prefix}addcolor <color> ...[color]`,
  };
}
