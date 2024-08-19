import { Message } from "discord.js";
import { Bot } from "../../bot.js";
import { Command } from "../../modules/command.js";
import type { ILanguage as lang } from "../../types.js";
import logger from "../../modules/logger.js";

export default class Pk extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  async run(client: Bot, message: Message, args: string[], language: lang) {
    logger.error("pk command has been executed");
    if (!args || args.length === 0) {
      const isEnabled = await client.db.getPkEnabled(message.author);
      const reply = isEnabled
        ? language.command.pk.enabled
        : language.command.pk.disabled;
      await message.channel.send({
        content: reply,
      });
      return;
    }
    const pkEnabled = args[0] == "enable";
    // TODO: check if pk has system
    await client.db.setPkEnabled(message.author, pkEnabled);

    await message.channel.send({
      content: pkEnabled
        ? language.command.pk.enabled
        : language.command.pk.disabled,
    });
  }
  help = {
    show: true,
    usage: `${this.prefix}pk [enable|disable]`,
  };
}
