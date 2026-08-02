import { Bot } from "@/bot.js";
import { Command } from "@/modules/command.js";
import logger from "@/modules/logger.js";
import type { ILanguage } from "@/types.js";
import { Message } from "discord.js";

export default class Color extends Command {
  readonly name = "color";
  constructor(client: Bot) {
    super(client, "Utility");
  }
  async run(client: Bot, message: Message, _args: string[], language: ILanguage) {
    if (!message.channel.isSendable()) {
      logger.error(`channel ${message.channel.id} is not sendable`);
      return;
    }
    const current_colors = new Set((await client.db.getColor(message.author)).split(";"));
    const colors = [...current_colors].join(", ");
    await message.channel.send({ content: language.command.color.show_colors.replace("{c}", colors) });
  }
  help = { show: true, usage: `${this.prefix}color` };
}
