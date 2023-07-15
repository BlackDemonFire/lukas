import { Bot } from "../../bot.js";
import { MultiUserGifCommand } from "../../modules/command.js";

export default class Hold extends MultiUserGifCommand {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }

  help = {
    show: true,
    usage: `${this.prefix}hold [user]`,
  };
}
