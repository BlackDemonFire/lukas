import { Bot } from "@/bot.js";
import { restart } from "@/execrestart.js";
import { Command } from "@/modules/command.js";
import logger from "@/modules/logger.js";
import type { ILanguage } from "@/types.js";
import { EmbedBuilder, Message } from "discord.js";
import { inspect } from "util";

export default class Restart extends Command {
  readonly name = "restart";
  help = { show: false, usage: `${this.prefix}restart` };
  constructor(client: Bot) {
    super(client, "Admin");
  }
  async run(client: Bot, message: Message, _args: string[], language: ILanguage) {
    let msg = null;

    if (!message.channel.isSendable()) {
      logger.error(`channel ${message.channel.id} is not sendable`);
      return;
    }
    if (message !== null) {
      msg = await message.channel.send(`<a:load_1:498280749271744512> ${language.command.restart.start}`);
    } else {
      msg = null;
    }
    logger.info("restarting bot...");
    try {
      await restart(client, msg, `<:check_4:498523284804075541> ${language.command.restart.success}`);
    } catch (error) {
      logger.error(error);
      const resErr = inspect(error);
      const embed = new EmbedBuilder()
        .setFooter({ text: `@${message.author.username}`, iconURL: message.author.defaultAvatarURL })
        .setColor(0xffcc4d)
        .setAuthor({ name: "Restart" })
        .setDescription(resErr);
      if (msg) await msg.edit({ content: `⚠ ${language.command.restart.error}`, embeds: [embed] });
    }
  }
}
