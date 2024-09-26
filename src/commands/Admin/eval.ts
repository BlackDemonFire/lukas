import { Message, SendableChannels } from "discord.js";
import { inspect } from "util";
import { Bot } from "../../bot.js";
import { Command } from "../../modules/command.js";
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
    // @ts-expect-error -- we want the client to be available for eval.
    client: Bot,
    message: Message,
    args: string[],
    language: ILanguage,
  ) {
    if (!message.channel.isSendable()) {
      logger.error(`channel ${message.channel.id} is not sendable`);
      return;
    }
    if (!super.isOwner(message)) {
      await message.channel.send({
        content: language.command.eval.permissionError,
      });
      return;
    }
    logger.info(message.author.tag, args.join(" "));
    try {
      const evaled: unknown = eval(args.join(" "));
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
          segments.map((m) =>
            (message.channel as SendableChannels).send({ content: m }),
          ),
        );
      } else {
        message.channel.send(
          "Eval executed successfully but did not return a value.",
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
        segments.map((m) =>
          (message.channel as SendableChannels).send({ content: m }),
        ),
      );
    }
  }
}
