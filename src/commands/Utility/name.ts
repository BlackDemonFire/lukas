import { Message } from "discord.js";
import { Bot } from "../../bot.js";
import { Command } from "../../modules/command.js";
import type { ILanguage } from "../../types.js";
import logger from "../../modules/logger.js";
import { db } from "../../drizzle.js";
import { userdb } from "../../db/userdb.js";
import { eq } from "drizzle-orm";

export default class Name extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  async run(
    _client: Bot,
    message: Message,
    args: string[],
    language: ILanguage,
  ) {
    if (!message.channel.isSendable()) {
      logger.error(`channel ${message.channel.id} is not sendable`);
      return;
    }
    let newname: string;
    if (!args || args.length === 0) {
      newname = "";
    } else {
      newname = args.join(" ");
    }
    await db
      .update(userdb)
      .set({ name: newname })
      .where(eq(userdb.id, message.author.id));
    await message.channel.send({
      content: language.command.name.success.replace("{newname}", newname),
    });
  }
  help = {
    show: true,
    usage: `${this.prefix}name [name]`,
  };
}
