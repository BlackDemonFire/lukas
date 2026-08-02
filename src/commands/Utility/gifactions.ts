import { Bot } from "@/bot.js";
import { Command } from "@/modules/command.js";
import logger from "@/modules/logger.js";
import type { ILanguage } from "@/types.js";
import { Message } from "discord.js";

export default class Gifaction extends Command {
  readonly name = "gifactions";
  constructor(client: Bot) {
    super(client, "Utility");
  }
  async run(client: Bot, message: Message, _args: string[], language: ILanguage) {
    if (!message.channel.isSendable()) {
      logger.error(`channel ${message.channel.id} is not sendable`);
      return;
    }
    const actions = await client.db.getGifactions();
    let actionsstring: string = "";
    switch (actions.length) {
      case 1:
        actionsstring = actions[0]!;
        break;
      case 2:
        actionsstring = actions.join(` ${language.general.and} `);
        break;
      default:
        actionsstring = `${actions
          .slice(0, -1)
          .map((action) => `\`${action}\``)
          .join(", ")} ${language.general.and} \`${actions.slice(-1).join(",")}\``;
        break;
    }
    await message.channel.send({ content: language.command.gifactions.response.replace("{actions}", actionsstring) });
  }
  help = { show: true, usage: `${this.prefix}gifaction` };
}
