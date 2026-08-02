import { Bot } from "@/bot.js";
import { MultiUserGifCommand } from "@/modules/command.js";

export default class Kiss extends MultiUserGifCommand {
  readonly name = "kiss";
  help = { show: true, usage: `${this.prefix}kiss [user]`, category: "Gifs" };
  constructor(client: Bot) {
    super(client, "Gifs");
  }
}
