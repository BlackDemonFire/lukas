import {
  EmbedBuilder,
  Message,
  OAuth2Scopes,
  PermissionsBitField,
} from "discord.js";
import { Bot } from "../../bot.js";
import { Command } from "../../modules/command.js";
import logger from "../../modules/logger.js";

export default class Link extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  async run(client: Bot, message: Message) {
    if (!message.channel.isSendable()) {
      logger.error(`channel ${message.channel.id} is not sendable`);
      return;
    }
    const embed: EmbedBuilder = new EmbedBuilder()
      .setTitle("Links")
      .setDescription(
        `[Invite](${client.generateInvite({
          scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
          permissions: PermissionsBitField.All,
        })})\n[GitHub](https://github.com/BlackDemonFire/lukas.git)`,
      )
      .setColor(0xaa7777);
    await message.channel.send({ embeds: [embed] });
  }
  help = {
    show: true,
    usage: `${this.prefix}link`,
  };
}
