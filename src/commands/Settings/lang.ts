import { Message, PermissionFlagsBits } from "discord.js";
import type { ILanguage as lang } from "src/types";
import { Bot } from "../../bot.js";
import { Command } from "../../modules/command.js";

export default class Lang extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  run(client: Bot, message: Message, args: string[], language: lang) {
    let newLang: string;
    let languages: string = "";
    if (!message.guild) {
      message.channel.send(language.general.guildOnly);
      return;
    }
    if (
      !(
        message.member!.permissions.has(PermissionFlagsBits.Administrator) ||
        this.isOwner(message)
      )
    ) {
      message.channel.send({ content: language.command.lang.permissionError });
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
          languages = langs[0];
          break;
        case 2:
          languages = langs.join(` ${language.general.and} `);
          break;
        default:
          break;
      }
      message.channel.send({
        content: language.command.lang.noSuchLanguage.replace(
          "{languages}",
          languages,
        ),
      });
      return;
    }
    client.db.setLang(message.guild, newLang);
    message.channel.send({
      content: language.command.lang.success.replace("{lang}", newLang),
    });
  }
  help = {
    show: true,
    usage: `${this.prefix}lang <lang>`,
  };
}
