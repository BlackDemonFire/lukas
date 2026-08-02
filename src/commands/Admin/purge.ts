import { Bot } from "@/bot.js";
import { Command } from "@/modules/command.js";
import logger from "@/modules/logger.js";
import type { ILanguage } from "@/types.js";
import { GuildChannel, Message, PermissionFlagsBits, TextChannel } from "discord.js";

export default class Purge extends Command {
  readonly name = "purge";
  help = { show: false, usage: `${this.prefix}purge <amount>` };
  constructor(client: Bot) {
    super(client, "Admin");
  }
  async run(_client: Bot, message: Message, args: string[], language: ILanguage) {
    if (!message.channel.isSendable()) {
      logger.error(`channel ${message.channel.id} is not sendable`);
      return;
    }
    if (!this.hasPermission(message)) {
      await message.channel.send(
        language.general.userPermissionError.replace("{}", language.permissions.MANAGE_MESSAGES),
      );
      return;
    }
    if (!(message.channel instanceof GuildChannel)) return;
    if (!message.guild!.members.me!.permissionsIn(message.channel).has(PermissionFlagsBits.ManageMessages)) {
      await message.channel.send({
        content: language.general.botPermissionError.replace("{}", language.permissions.MANAGE_MESSAGES),
      });
      return;
    }
    if (!(message.channel instanceof TextChannel)) return;
    let amount: number | undefined = undefined;
    try {
      amount = parseInt(args[0] ?? "");
    } catch (e) {
      await message.channel.send({ content: language.command.purge.error.notNumeric });
      logger.error(e);
    }
    if (!amount) {
      await message.channel.send({ content: language.command.purge.error.notNumeric });
      return;
    }
    await message.channel.bulkDelete(amount);
  }
  hasPermission(message: Message): boolean {
    if (super.isOwner(message)) return true;
    if (!(message.channel instanceof GuildChannel)) return false;
    if (message.member?.permissionsIn(message.channel).has(PermissionFlagsBits.ManageMessages)) return true;
    return false;
  }
}
