import { Message } from "discord.js";
import { inspect } from "util";
import { Bot } from "../bot.js";
import { Command } from "../modules/command.js";
import logger from "../modules/logger.js";
import { splitMessage } from "../modules/splitMessage.js";
import type { ILanguage } from "../types.js";

export default class Eval extends Command {
  constructor(client: Bot) {
    super(client);
  }
  help = {
    show: false,
    name: "eval",
    usage: `${this.prefix}eval <code>`,
    category: "Owner only",
  };
  run(_client: Bot, message: Message, args: string[], language: ILanguage) {
    if (!super.isOwner(message)) {
      message.channel.send({ content: language.command.eval.permissionError });
      return;
    }
    logger.info(message.author.tag, args.join(" "));
    try {
      const evaled = eval(args.join(" "));
      logger.info(message.author.tag, args.join(" "), evaled);
      if (evaled) {
        const segments = splitMessage(
          "```js\n{evaled}```".replace("{evaled}", inspect(evaled)),
          {
            append: "```",
            prepend: "```js\n",
            char: "\n",
          },
        );
        segments.forEach((m) => message.channel.send({ content: m }));
      }
    } catch (err) {
      logger.error(
        `at commands/eval by ${message.author.tag}, using lines ${args.join(
          " ",
        )}, resulting in ${err}`,
      );
      const segments = splitMessage(
        "```js\n{error}```".replace("{error}", inspect(err)),
        {
          append: "```",
          prepend: "```js\n",
          char: "\n",
        },
      );
      segments.forEach((m) => message.channel.send({ content: m }));
    }
  }
}
