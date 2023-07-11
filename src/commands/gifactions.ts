import { Message } from "discord.js";
import type { ILanguage as lang } from "src/types";
import { Bot } from "../bot.js";
import { Command } from "../modules/command.js";

export default class Gifaction extends Command {
  constructor(client: Bot) {
    super(client);
  }
  async run(client: Bot, message: Message, _args: string[], language: lang) {
    const actions = await client.db.getgifactions();
    let actionsstring: string = "";
    switch (actions.length) {
      case 1:
        actionsstring = actions[0];
        break;
      case 2:
        actionsstring = actions.join(` ${language.general.and} `);
        break;
      default:
        break;
    }
    message.channel.send({
      content: language.command.gifactions.response.replace(
        "{actions}",
        actionsstring,
      ),
    });
  }
  help = {
    show: true,
    name: "gifaction",
    usage: `${this.prefix}gifaction`,
    category: "gifs",
  };
}
