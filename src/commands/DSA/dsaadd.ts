import { Message } from "discord.js";
import { Bot } from "../../bot.js";
import { Command } from "../../modules/command.js";
import type { ILanguage as lang } from "../../types.js";
import logger from "../../modules/logger.js";
import { db } from "../../drizzle.js";
import { dsachars } from "../../db/dsachars.js";

export default class Dsaadd extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  help = {
    show: true,
    usage: `${this.prefix}dsaadd <character> [avatar - if it doesn't start with \`http\`, it will be ignored.] <displayed name>`,
  };
  async run(_client: Bot, message: Message, args: string[], language: lang) {
    if (!message.channel.isSendable()) {
      logger.error(`channel ${message.channel.id} is not sendable`);
      return;
    }
    if (!args || args.length <= 3) {
      await message.channel.send(language.command.dsaadd.args);
      return;
    }
    const pref: string = args.shift()!.slice().toLowerCase();
    const img: string = args[0].includes("http") ? args.shift()! : "";
    const name: string = args.join(" ");
    await db
      .insert(dsachars)
      .values({ displayname: name, prefix: pref, avatar: img });
    await message.channel.send({
      content: language.command.dsaadd.success.replace("{pref}", pref),
    });
  }
}
