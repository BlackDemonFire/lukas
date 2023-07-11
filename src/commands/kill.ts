import { EmbedBuilder, Message } from "discord.js";
import type { ILanguage as lang } from "src/types";
import { Bot } from "../bot.js";
import { Command } from "../modules/command.js";
import logger from "../modules/logger.js";

export default class Kill extends Command {
  constructor(client: Bot) {
    super(client);
  }
  help = {
    show: false,
    name: "kill",
    usage: `${this.prefix}kill`,
    category: "Owner only",
  };
  async run(client: Bot, message: Message, _args: string[], language: lang) {
    if (!super.isOwner(message)) {
      message.channel.send({ content: language.command.kill.permissionError });
      return;
    }
    if (message !== null) {
      const plaintext = language.command.kill.success;
      const embed = new EmbedBuilder()
        .setImage("https://i.imgflip.com/19f1vf.jpg")
        .setColor(0x36393e)
        .setFooter({
          text: `@${message.author.username}`,
          iconURL: message.author.defaultAvatarURL,
        });
      await message.channel.send({ content: plaintext, embeds: [embed] });
    }
    logger.info("stopping bot...");
    client.destroy();
    process.exit();
  }
}
