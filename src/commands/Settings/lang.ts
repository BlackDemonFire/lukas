import { Bot } from "@/bot.js";
import { Command } from "@/modules/command.js";
import logger from "@/modules/logger.js";
import type { ILanguage } from "@/types.js";
import { Message, PermissionFlagsBits } from "discord.js";

export default class Lang extends Command {
  help = { show: true, usage: `${this.prefix}lang <lang>` };
  readonly name = "lang";
  constructor(client: Bot) {
    super(client, "settings");
  }
  async run(client: Bot, message: Message, args: string[], language: ILanguage) {
    if (!message.channel.isSendable()) {
      logger.error(`channel ${message.channel.id} is not sendable`);
      return;
    }
    let newLang: string;
    let languages: string = "";
    if (!message.guild) {
      await message.channel.send(language.general.guildOnly);
      return;
    }
    if (!(message.member!.permissions.has(PermissionFlagsBits.Administrator) || this.isOwner(message))) {
      await message.channel.send({ content: language.command.lang.permissionError });
      return;
    }
    if (!args || args.length === 0) {
      newLang = "";
    } else {
      newLang = args.join(" ");
    }
    if (!client.languages.has(newLang)) {
      const langs = Array.from(client.languages.keys());
      switch (langs.length) {
        case 1:
          languages = langs[0]!;
          break;
        case 2:
          languages = langs.join(` ${language.general.and} `);
          break;
        default:
          languages = `${langs
            .slice(0, -1)
            .map((langName) => `\`${langName}\``)
            .join(", ")} ${language.general.and} \`${langs.slice(-1).join(",")}\``;
          break;
      }
      await message.channel.send({ content: language.command.lang.noSuchLanguage.replace("{languages}", languages) });
      return;
    }
    await client.db.setLang(message.guild, newLang);
    await message.channel.send({ content: language.command.lang.success.replace("{lang}", newLang) });
  }
}
