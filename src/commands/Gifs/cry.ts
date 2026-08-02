import { Bot } from "@/bot.js";
import { SingleUserGifCommand } from "@/modules/command.js";

export default class Cry extends SingleUserGifCommand {
  readonly name = "cry";
  help = { show: true, usage: `${this.prefix}cry` };
  constructor(client: Bot) {
    super(client, "Gifs");
  }
}
