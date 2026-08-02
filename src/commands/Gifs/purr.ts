import { Bot } from "@/bot.js";
import { SingleUserGifCommand } from "@/modules/command.js";

export default class Purr extends SingleUserGifCommand {
  readonly name = "purr";
  help = { show: true, usage: `${this.prefix}purr` };
  constructor(client: Bot) {
    super(client, "Gifs");
  }
}
