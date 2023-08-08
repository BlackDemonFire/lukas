import { Message } from "discord.js";
import { Bot } from "../../bot.js";
import { Command } from "../../modules/command.js";
import type { ILanguage as lang } from "../../types.js";

export default class Dsaadd extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  help = {
    show: true,
    usage: `${this.prefix}dsaadd <character> [avatar - if it doesn't start with \`http\`, it will be ignored.] <displayed name>`,
  };
  async run(client: Bot, message: Message, args: string[], language: lang) {
    if (!args || args.length <= 3) {
      message.channel.send(language.command.dsaadd.args);
      return;
    }
    const pref: string = args.shift()!.slice().toLowerCase();
    const img: string = args[0].includes("http") ? args.shift()! : "";
    const name: string = args.join(" ");
    client.db.newDSAChar(pref, name, img);
    message.channel.send({
      content: language.command.dsaadd.success.replace("{pref}", pref),
    });
  }
}
