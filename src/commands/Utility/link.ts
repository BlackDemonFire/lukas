import { Bot } from "@/bot.js";
import { Command } from "@/modules/command.js";
import logger from "@/modules/logger.js";
import { EmbedBuilder, Message, OAuth2Scopes, PermissionsBitField } from "discord.js";

export default class Link extends Command {
  readonly name = "link";
  constructor(client: Bot) {
    super(client, "Utility");
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
  help = { show: true, usage: `${this.prefix}link` };
}
