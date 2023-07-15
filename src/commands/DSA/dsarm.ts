import { Message } from "discord.js";
import type { ILanguage as lang } from "src/types";
import { Bot } from "../../bot.js";
import { Command } from "../../modules/command.js";

export default class Dsarm extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  help = {
    show: true,
    usage: `${this.prefix}dsarm <character>`,
  };
  async run(client: Bot, message: Message, args: string[], language: lang) {
    const pref: string | undefined = args.shift()?.slice().toLowerCase();
    if (!pref) {
      message.reply({ content: language.command.dsarm.args });
      return;
    }
    if (!(await client.db.getDSAChar(pref))) {
      message.channel.send({
        content: language.command.dsarm.noSuchChar.replace("{pref}", pref),
      });
      return;
    }
    client.db.deleteDSAChar(pref);
    message.channel.send({
      content: language.command.dsarm.success.replace("{pref}", pref),
    });
  }
}
