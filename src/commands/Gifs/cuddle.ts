import { Bot } from "@/bot.js";
import { MultiUserGifCommand } from "@/modules/command.js";

export default class Cuddle extends MultiUserGifCommand {
  readonly name = "cuddle";
  help = { show: true, usage: `${this.prefix}cuddle [user]` };
  constructor(client: Bot) {
    super(client, "Gifs");
  }
}
