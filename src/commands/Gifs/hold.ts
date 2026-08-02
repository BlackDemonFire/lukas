import { Bot } from "@/bot.js";
import { MultiUserGifCommand } from "@/modules/command.js";

export default class Hold extends MultiUserGifCommand {
  readonly name = "hold";
  help = { show: true, usage: `${this.prefix}hold [user]` };
  constructor(client: Bot) {
    super(client, "Gifs");
  }
}
