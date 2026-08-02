import { Bot } from "@/bot.js";
import { Command } from "@/modules/command.js";
import logger from "@/modules/logger.js";
import type { ILanguage } from "@/types.js";
import { DMChannel, Message, MessageCollector, type SendableChannels, TextChannel } from "discord.js";

export default class New extends Command {
  readonly name = "new";
  help = { show: true, usage: `${this.prefix}new` };
  constructor(client: Bot) {
    super(client, "DSA");
  }
  async run(client: Bot, message: Message, _args: string[], language: ILanguage) {
    if (!message.channel.isSendable()) {
      logger.error(`channel ${message.channel.id} is not sendable`);
      return;
    }
    let i = 0;
    let av: string;
    let pref: string;
    await message.channel.send({ content: language.command.new.getPrefix });
    if (!(message.channel instanceof DMChannel || message.channel instanceof TextChannel)) return;
    const collector = new MessageCollector(message.channel, {
      filter: (m: Message) => m.author.id === message.author.id,
      time: 50000,
    });
    // oxlint-disable-next-line @typescript-eslint/no-misused-promises
    collector.on("end", async (msgs) => {
      if (msgs.size == 0) {
        await (message.channel as SendableChannels).send({ content: language.general.timeout });
        return;
      }
    });
    // oxlint-disable-next-line @typescript-eslint/no-misused-promises
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
          pref = msg.content.toLowerCase().split(" ")[0]!;
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
              content: language.command.new.success.replace("{name}", name).replace("{pref}", pref),
            });
            await client.db.newDSAChar(pref, name, av);
          }
          break;
      }
    });
  }
}
