import { ColorResolvable, resolveColor } from "discord.js";
import { Bot } from "../../bot.js";
import { Command, CommandInput } from "../../modules/command.js";
import logger from "../../modules/logger.js";
import type { ILanguage } from "../../types.js";

export default class Removecolor extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  async run(
    client: Bot,
    message: CommandInput,
    args: string[],
    language: ILanguage,
  ) {
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
        logger.debug([...current_colors].join(" "));
        logger.debug(color_string);
        logger.debug(color_string in current_colors);
        const found = current_colors.delete(color_string);
        logger.debug(`Color ${color} was ${found ? "" : "not"} removed`);
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
    usage: `${this.prefix}removecolor <color> ...[color]`,
  };
}
