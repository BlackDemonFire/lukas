import { inspect } from "util";
import { Bot } from "../../bot.js";
import { Command, CommandInput } from "../../modules/command.js";
import logger from "../../modules/logger.js";
import { splitMessage } from "../../modules/splitMessage.js";
import type { ILanguage } from "../../types.js";

export default class Eval extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  help = {
    show: false,
    usage: `${this.prefix}eval <code>`,
  };
  async run(
    _client: Bot,
    message: CommandInput,
    args: string[],
    language: ILanguage,
  ) {
    if (!super.isOwner(message)) {
      await message.channel.send({
        content: language.command.eval.permissionError,
      });
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
        await Promise.all(
          segments.map((m) => message.channel.send({ content: m })),
        );
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
      await Promise.all(
        segments.map((m) => message.channel.send({ content: m })),
      );
    }
  }
}
