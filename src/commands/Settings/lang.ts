import { PermissionFlagsBits } from "discord.js";
import { Bot } from "../../bot.js";
import { Command, CommandInput } from "../../modules/command.js";
import type { ILanguage } from "../../types.js";

export default class Lang extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  async run(
    client: Bot,
    message: CommandInput,
    args: string[],
    language: ILanguage,
  ) {
    let newLang: string;
    let languages: string = "";
    if (!message.guild) {
      await message.channel.send(language.general.guildOnly);
      return;
    }
    if (
      !(
        message.member!.permissions.has(PermissionFlagsBits.Administrator) ||
        this.isOwner(message)
      )
    ) {
      await message.channel.send({
        content: language.command.lang.permissionError,
      });
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
          languages = `${langs
            .slice(0, -1)
            .map((langName) => `\`${langName}\``)
            .join(", ")} ${language.general.and} \`${langs.slice(-1)}\``;
          break;
      }
      await message.channel.send({
        content: language.command.lang.noSuchLanguage.replace(
          "{languages}",
          languages,
        ),
      });
      return;
    }
    await client.db.setLang(message.guild, newLang);
    await message.channel.send({
      content: language.command.lang.success.replace("{lang}", newLang),
    });
  }
  help = {
    show: true,
    usage: `${this.prefix}lang <lang>`,
  };
}
