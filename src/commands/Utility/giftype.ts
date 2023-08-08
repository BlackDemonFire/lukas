import { Message } from "discord.js";
import { Bot } from "../../bot.js";
import { Command } from "../../modules/command.js";
import type { ILanguage as lang } from "../../types.js";

export default class Giftype extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  async run(client: Bot, message: Message, args: string[], language: lang) {
    const giftype: string = args[0].toLowerCase();
    const types = ["anime"];
    if (!types.includes(giftype)) {
      let typesstring = "";
      switch (types.length) {
        case 1:
          typesstring = types[0];
          break;
        case 2:
          typesstring = types.join(` ${language.general.and} `);
          break;
        default:
          break;
      }
      message.channel.send({
        content: language.command.giftype.availableTypes.replace(
          "{types}",
          typesstring,
        ),
      });
      return;
    }
    client.db.setgiftype(message.author, giftype);
  }
  help = {
    show: true,
    usage: `${this.prefix}giftype <type>`,
  };
}
