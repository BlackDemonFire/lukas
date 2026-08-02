import { Bot } from "@/bot.js";
import { MultiUserGifCommand } from "@/modules/command.js";

export default class Hug extends MultiUserGifCommand {
  readonly name = "hug";
  help = { show: true, usage: `${this.prefix}hug [user]` };
  constructor(client: Bot) {
    super(client, "Gifs");
  }
}
