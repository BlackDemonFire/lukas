import { Bot } from "@/bot.js";
import { Command } from "@/modules/command.js";
import logger from "@/modules/logger.js";
import type { ILanguage } from "@/types.js";
import { Message } from "discord.js";

export default class Giftype extends Command {
  readonly name = "giftype";
  constructor(client: Bot) {
    super(client, "Utility");
  }
  async run(client: Bot, message: Message, args: string[], language: ILanguage) {
    if (!message.channel.isSendable()) {
      logger.error(`channel ${message.channel.id} is not sendable`);
      return;
    }
    const types = await client.db.getGiftypes();
    let typesstring = "";
    switch (types.length) {
      case 1:
        typesstring = types[0]!;
        break;
      case 2:
        typesstring = types.join(` ${language.general.and} `);
        break;
      default:
        break;
    }

    const giftype: string = args.length === 0 ? "" : args[0]!.toLowerCase();
    if (args.length == 0 || !types.includes(giftype)) {
      await message.channel.send({ content: language.command.giftype.availableTypes.replace("{types}", typesstring) });
      return;
    }
    await client.db.setGiftype(message.author, giftype);
  }
  help = { show: true, usage: `${this.prefix}giftype <type>` };
}
