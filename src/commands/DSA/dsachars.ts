import { EmbedBuilder, Message } from "discord.js";
import { Bot } from "../../bot.js";
import { Command } from "../../modules/command.js";
import logger from "../../modules/logger.js";

export default class Dsachars extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  help = {
    show: true,
    usage: `${this.prefix}dsachars`,
  };
  async run(client: Bot, message: Message) {
    if (!message.channel.isSendable()) {
      logger.error(`channel ${message.channel.id} is not sendable`);
      return;
    }
    const chars = await client.db.listChars();
    const embeds = [];
    for (const char of chars) {
      const embed = new EmbedBuilder().setDescription(char.prefix);
      if (char.displayname) embed.setTitle(char.displayname);
      if (char.avatar) embed.setImage(char.avatar);
      embeds.push(embed);
    }
    await message.channel.send({
      content: "DSA Characters",
      embeds: [...embeds.splice(0, 10)],
    });
    while (embeds.length > 0) {
      await message.channel.send({ embeds: [...embeds.splice(0, 10)] });
    }
  }
}
