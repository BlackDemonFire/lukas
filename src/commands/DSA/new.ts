import type { Message, SendableChannels } from "discord.js";
import type { Bot } from "../../bot.js";
import { dsachars } from "../../db/dsachars.js";
import { db } from "../../drizzle.js";
import { Command } from "../../modules/command.js";
import logger from "../../modules/logger.js";
import type { ILanguage as lang } from "../../types.js";

export default class New extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  help = {
    show: true,
    usage: `${this.prefix}new`,
  };
  async run(_client: Bot, message: Message, _args: string[], language: lang) {
    if (!message.channel.isSendable()) {
      logger.error(`channel ${message.channel.id} is not sendable`);
      return;
    }
    let i = 0;
    let av: string;
    let pref: string;
    await message.channel.send({ content: language.command.new.getPrefix });

    const collector = message.channel.createMessageCollector({
      filter: (m: Message) => m.author.id === message.author.id,
      time: 50000,
    });
    collector.on("end", async (msgs) => {
      if (msgs.size == 0) {
        await (message.channel as SendableChannels).send({
          content: language.general.timeout,
        });
        return;
      }
    });
    collector.on("collect", async (msg) => {
      if (!msg.channel.isSendable()) {
        logger.error(`channel ${msg.channel.id} is not sendable`);
        return;
      }
      if (i > 2) {
        collector.stop();
      } else {
        i = i + 1;
      }
      switch (i) {
        case 1:
          pref = msg.content.toLowerCase().split(" ")[0];
          await msg.channel.send({ content: language.command.new.getAvatar });
          if (!pref.startsWith("$")) pref = `$${pref}`;
          break;
        case 2:
          if (msg.content === "n") {
            av = "";
          } else {
            av = msg.content;
          }
          await msg.channel.send({ content: language.command.new.getName });
          break;
        case 3:
          {
            const name = msg.content;
            collector.stop();
            await msg.channel.send({
              content: language.command.new.success
                .replace("{name}", name)
                .replace("{pref}", pref),
            });
            await db
              .insert(dsachars)
              .values({ prefix: pref, displayname: name, avatar: av });
          }
          break;
      }
    });
  }
}
