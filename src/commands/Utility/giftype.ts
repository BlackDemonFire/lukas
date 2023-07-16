import { Message } from "discord.js";
import type { ILanguage as lang } from "src/types";
import { Bot } from "../../bot.js";
import { Command } from "../../modules/command.js";

export default class Giftype extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  async run(client: Bot, message: Message, args: string[], language: lang) {
    const types = await client.db.getgiftypes();
    types.push("any");
    let typesstring = "";

    if (args.length === 0) {
      message.channel.send({
        content: language.command.giftype.availableTypes.replace(
          "{types}",
          (typesstring = types.join(", ")),
        ),
      });
      return;
    }

    const giftype: string = args[0].toLowerCase();
    if (!types.includes(giftype)) {
      switch (types.length) {
        case 1:
          typesstring = types[0];
          break;
        case 2:
          typesstring = types.join(` ${language.general.and} `);
          break;
        default:
          typesstring = types.join(", ");
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
    message.channel.send({
      content: language.command.giftype.success,
    });
  }
  help = {
    show: true,
    usage: `${this.prefix}giftype <type>`,
  };
}
