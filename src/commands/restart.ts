import { EmbedBuilder, Message } from "discord.js";
import type { ILanguage as lang } from "src/types";
import { inspect } from "util";
import { Bot } from "../bot.js";
import { restart } from "../execrestart.js";
import { Command } from "../modules/command.js";
import logger from "../modules/logger.js";

export default class Restart extends Command {
  constructor(client: Bot) {
    super(client);
  }
  help = {
    show: false,
    name: "restart",
    usage: `${this.prefix}restart`,
    category: "Owner only",
  };
  async run(client: Bot, message: Message, _args: string[], language: lang) {
    // code
    let msg = null;
    if (message !== null) {
      msg = await message.channel.send(
        `<a:load_1:498280749271744512> ${language.command.restart.start}`,
      );
    } else {
      msg = null;
    }
    logger.info("restarting bot...");
    try {
      restart(
        client,
        msg,
        `<:check_4:498523284804075541> ${language.command.restart.success}`,
      );
    } catch (error) {
      logger.error(error);
      const resErr = inspect(error);
      const embed = new EmbedBuilder()
        .setFooter({
          text: `@${message.author.username}`,
          iconURL: message.author.defaultAvatarURL,
        })
        .setColor(0xffcc4d)
        .setAuthor({ name: "Restart" })
        .setDescription(resErr);
      if (msg)
        msg.edit({
          content: `⚠ ${language.command.restart.error}`,
          embeds: [embed],
        });
    }
  }
}
