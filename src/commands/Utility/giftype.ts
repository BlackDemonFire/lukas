import { Message } from "discord.js";
import type { Bot } from "../../bot.js";
import { Command } from "../../modules/command.js";
import type { ILanguage } from "../../types.js";
import logger from "../../modules/logger.js";
import { db } from "../../drizzle.js";
import { userdb } from "../../db/userdb.js";
import { eq } from "drizzle-orm";
import { gifdb } from "../../db/gifdb.js";

export default class Giftype extends Command {
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
    const types = await db
      .select({ type: gifdb.giftype })
      .from(gifdb)
      .then((a) => a.map((b) => b.type));
    const lf = new Intl.ListFormat(); // TODO: use the correct language

    const typesstring = lf.format(types.filter((a) => a !== null));

    const giftype: string = args.length == 0 ? "" : args[0].toLowerCase();
    if (args.length == 0 || !types.includes(giftype)) {
      await message.channel.send({
        content: language.command.giftype.availableTypes.replace(
          "{types}",
          typesstring,
        ),
      });
      return;
    }
    await db
      .update(userdb)
      .set({ giftype })
      .where(eq(userdb.id, message.author.id));
  }
  help = {
    show: true,
    usage: `${this.prefix}giftype <type>`,
  };
}
