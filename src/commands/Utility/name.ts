import { Message } from "discord.js";
import { Bot } from "../../bot.js";
import { Command } from "../../modules/command.js";
import type { ILanguage as lang } from "../../types.js";

export default class Name extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  async run(client: Bot, message: Message, args: string[], language: lang) {
    let newname: string;
    if (!args || args.length === 0) {
      newname = "";
    } else {
      newname = args.join(" ");
    }
    await client.db.setName(message.author, newname);
    await message.channel.send({
      content: language.command.name.success.replace("{newname}", newname),
    });
  }
  help = {
    show: true,
    usage: `${this.prefix}name [name]`,
  };
}
