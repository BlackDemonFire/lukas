import { EmbedBuilder } from "discord.js";
import { inspect } from "util";
import { Bot } from "../../bot.js";
import { restart } from "../../execrestart.js";
import { Command, CommandInput } from "../../modules/command.js";
import logger from "../../modules/logger.js";
import type { ILanguage as lang } from "../../types.js";

export default class Restart extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  help = {
    show: false,
    usage: `${this.prefix}restart`,
  };
  async run(
    client: Bot,
    message: CommandInput,
    _args: string[],
    language: lang,
  ) {
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
      await restart(
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
        await msg.edit({
          content: `⚠ ${language.command.restart.error}`,
          embeds: [embed],
        });
    }
  }
}
