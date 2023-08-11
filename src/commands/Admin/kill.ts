import { EmbedBuilder, Message } from "discord.js";
import { Bot } from "../../bot.js";
import { Command } from "../../modules/command.js";
import logger from "../../modules/logger.js";
import type { ILanguage as lang } from "../../types.js";

export default class Kill extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  help = {
    show: false,
    usage: `${this.prefix}kill`,
  };
  async run(client: Bot, message: Message, _args: string[], language: lang) {
    if (!super.isOwner(message)) {
      await message.channel.send({
        content: language.command.kill.permissionError,
      });
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
    await client.destroy();
    process.exit();
  }
}
