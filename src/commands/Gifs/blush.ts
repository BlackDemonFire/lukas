import type { Bot } from "@/bot.js";
import { SingleUserGifCommand } from "@/modules/command.js";

export default class Blush extends SingleUserGifCommand {
  readonly name = "blush";
  constructor(client: Bot) {
    super(client, "Gifs");
  }

  help = { show: true, usage: `${this.prefix}blush` };
}
