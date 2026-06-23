import { Message, PermissionFlagsBits } from "discord.js";
import { Bot } from "../../bot.js";
import { Command } from "../../modules/command.js";
import type { ILanguage as lang } from "../../types.js";
import logger from "../../modules/logger.js";

export default class AutoRoll extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  async run(client: Bot, message: Message, args: string[], language: lang) {
    if (!message.channel.isSendable()) {
      logger.error(`channel ${message.channel.id} is not sendable`);
      return;
    }
    if (!message.guild) {
      await message.channel.send(language.general.guildOnly);
      return;
    }
    if (!(message.member!.permissions.has(PermissionFlagsBits.Administrator) || this.isOwner(message))) {
      await message.channel.send({ content: language.command.autoroll.permissionError });
      return;
    }
    const arg = !args || args.length === 0 ? "" : args.join(" ").toLowerCase().trim();

    if (!arg) {
      await message.channel.send({ content: language.command.autoroll.invalidArg });
      return;
    }
    const parsed = ["t", "true", "y", "yes", "j"].includes(arg)
      ? true
      : ["f", "false", "n", "no"].includes(arg)
        ? false
        : undefined;
    if (parsed === undefined) {
      await message.channel.send({ content: language.command.autoroll.invalidArg });
      return;
    }
    await client.db.setAutorollEnabled(message.guild, parsed);
    await message.channel.send({
      content: language.command.autoroll.success.replace(
        "{active}",
        parsed ? language.command.autoroll.active : language.command.autoroll.inactive,
      ),
    });
  }
  help = { show: true, usage: `${this.prefix}autoroll <y/n>` };
}
