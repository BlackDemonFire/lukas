import { Bot } from "@/bot.js";
import { MultiUserGifCommand } from "@/modules/command.js";

export default class Pat extends MultiUserGifCommand {
  readonly name = "pat";
  help = { show: true, usage: `${this.prefix}pat [user]` };
  constructor(client: Bot) {
    super(client, "Gifs");
  }
}
