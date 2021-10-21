import { Message, Util } from "discord.js";
import type { language as lang } from "src/types";
import { inspect } from "util";
import { Bot } from "../bot.js";
import { Command } from "../modules/command.js";
import logger from "../modules/logger.js";

export default class Eval extends Command {
    constructor(client: Bot) {
        super(client);
    }
    help = {
        show: false,
        name: "eval",
        usage: `${this.prefix}eval <code>`,
        category: "Owner only",
    }
    run(_client: Bot, message: Message, args: string[], language: lang) {
        if (!super.isOwner(message)) {
            message.channel.send(language.command.eval.permissionError);
            return;
        }
        logger.info(message.author.tag, args.join(" "));
        try {
            const evaled = eval(args.join(" "));
            logger.info(message.author.tag, args.join(" "), evaled);
            if (evaled) {
                const splitMessage = Util.splitMessage("```js\n{evaled}```".replace("{evaled}", inspect(evaled)), {
                    append: "```",
                    prepend: "```js\n",
                    char: "\n",
                });
                splitMessage.forEach((m) => message.channel.send(m));
            }
        } catch (err) {
            logger.error(`at commands/eval by ${message.author.tag}, using lines ${args.join(" ")}, resulting in ${err}`);
            const splitMessage = Util.splitMessage("```js\n{error}```".replace("{error}", inspect(err)), {
                append: "```",
                prepend: "```js\n",
                char: "\n",
            });
            splitMessage.forEach((m) => message.channel.send(m));
        }
    }
}