import { Message } from "discord.js";
import type { language as lang } from "src/types";
import { Bot } from "../bot.js";
import { Command } from "../modules/command.js";

export default class Name extends Command {
  constructor(client: Bot) {
    super(client);
  }
  run(client: Bot, message: Message, args: string[], language: lang) {
    let newname: string;
    if (!args || args == []) {
      newname = "";
    } else {
      newname = args.join(" ");
    }
    client.db.setname(message.author, newname);
    message.channel.send({
      content: language.command.name.success.replace("{newname}", newname),
    });
  }
  help = {
    show: true,
    name: "name",
    usage: `${this.prefix}name [name]`,
    category: "gifs",
  };
}
