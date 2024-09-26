import { Message } from "discord.js";
import { Bot } from "../../bot.js";
import { Command } from "../../modules/command.js";
import type { ILanguage } from "../../types.js";
import logger from "../../modules/logger.js";
import { db } from "../../drizzle.js";
import { gifdb } from "../../db/gifdb.js";

export default class Gifaction extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  async run(
    _client: Bot,
    message: Message,
    _args: string[],
    language: ILanguage,
  ) {
    if (!message.channel.isSendable()) {
      logger.error(`channel ${message.channel.id} is not sendable`);
      return;
    }
    const actions = await db
      .select({ action: gifdb.actiontype })
      .from(gifdb)
      .then((a) => a.map((b) => b.action));
    const lf = new Intl.ListFormat(); // TODO: use the correct language
    const actionsstring: string = lf.format(actions.filter((a) => a !== null));
    await message.channel.send({
      content: language.command.gifactions.response.replace(
        "{actions}",
        actionsstring,
      ),
    });
  }
  help = {
    show: true,
    usage: `${this.prefix}gifaction`,
  };
}
