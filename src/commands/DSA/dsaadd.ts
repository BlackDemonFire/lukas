import { Bot } from "@/bot.js";
import { Command } from "@/modules/command.js";
import logger from "@/modules/logger.js";
import type { ILanguage } from "@/types.js";
import { Message } from "discord.js";

export default class Dsaadd extends Command {
  readonly name = "dsaadd";
  help = {
    show: true,
    usage: `${this.prefix}dsaadd <character> [avatar - if it doesn't start with \`http\`, it will be ignored.] <displayed name>`,
  };
  constructor(client: Bot) {
    super(client, "DSA");
  }
  async run(client: Bot, message: Message, args: string[], language: ILanguage) {
    if (!message.channel.isSendable()) {
      logger.error(`channel ${message.channel.id} is not sendable`);
      return;
    }
    if (!args || args.length <= 3) {
      await message.channel.send(language.command.dsaadd.args);
      return;
    }
    const pref: string = args.shift()!.slice().toLowerCase();
    const img: string = args[0]?.includes("http") ? args.shift()! : "";
    const name: string = args.join(" ");
    await client.db.newDSAChar(pref, name, img);
    await message.channel.send({ content: language.command.dsaadd.success.replace("{pref}", pref) });
  }
}
