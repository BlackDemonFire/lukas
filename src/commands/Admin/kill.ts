import { Bot } from "@/bot.js";
import { Command } from "@/modules/command.js";
import logger from "@/modules/logger.js";
import type { ILanguage } from "@/types.js";
import { EmbedBuilder, Message } from "discord.js";

export default class Kill extends Command {
  help = { show: false, usage: `${this.prefix}kill` };
  readonly name = "kill";
  constructor(client: Bot) {
    super(client, "Admin");
  }
  async run(client: Bot, message: Message, _args: string[], language: ILanguage) {
    if (!message.channel.isSendable()) {
      logger.error(`channel ${message.channel.id} is not sendable`);
      return;
    }
    if (!super.isOwner(message)) {
      await message.channel.send({ content: language.command.kill.permissionError });
      return;
    }
    if (message !== null) {
      const plaintext = language.command.kill.success;
      const embed = new EmbedBuilder()
        .setImage("https://i.imgflip.com/19f1vf.jpg")
        .setColor(0x36393e)
        .setFooter({ text: `@${message.author.username}`, iconURL: message.author.defaultAvatarURL });
      await message.channel.send({ content: plaintext, embeds: [embed] });
    }
    logger.info("stopping bot...");
    await client.destroy();
    process.exit();
  }
}
