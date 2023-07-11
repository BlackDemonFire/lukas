import { ColorResolvable, Message, resolveColor } from "discord.js";
import { Bot } from "../bot.js";
import { Command } from "../modules/command.js";
import type { ILanguage as lang } from "../types";

export default class Color extends Command {
  constructor(client: Bot) {
    super(client);
  }
  run(client: Bot, message: Message, args: string[], language: lang) {
    let color: ColorResolvable;
    if (args && args.length > 0) {
      color = args[0] as ColorResolvable;
      try {
        resolveColor(color);
      } catch (e) {
        message.channel.send(language.command.color.invalid_color);
        return;
      }
    } else {
      color = "Random";
    }
    client.db.setcolor(message.author, color as string);
    message.channel.send({ content: language.command.color.success });
  }
  help = {
    show: true,
    name: "color",
    usage: `${this.prefix}color [color]`,
    category: "Utility",
  };
}
