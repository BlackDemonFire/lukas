import { Bot } from "../../bot.js";
import { SingleUserGifCommand } from "../../modules/command.js";

export default class Purr extends SingleUserGifCommand {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }

  help = {
    show: true,
    usage: `${this.prefix}purr`,
  };
}
