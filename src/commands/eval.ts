import { Bot } from "bot"
import { Message } from "discord.js"
import { Command } from "../modules/command"
import { inspect } from "util"

export default class Eval extends Command {
    constructor(client: Bot) {
        super(client)
    }
    help = {
        show: false,
        name: "eval",
        usage: `${this.prefix}eval <code>`,
        category: "Owner only"
    }
    run(client: Bot, message: Message, args: string[], language: language) {
        if (!super.isOwner(message)) return message.channel.send(language.command.eval.permissionError);
        client.logger.eval(message.author.tag, args.join(" "));
        try {
            const evaled = eval(args.join(" "));
            client.logger.evalOut(message.author.tag, args.join(" "), evaled);
            if (evaled) message.channel.send("```js\n{evaled}```".replace("{evaled}", evaled), {
                split: {
                    append: "```",
                    prepend: "```js\n",
                    char: "\n"
                }
            });
        } catch (err) {
            client.logger.evalError(message.author.tag, args.join(" "), err)
            message.channel.send("```js\n{error}```".replace("{error}", inspect(err)), {
                split: {
                    append: "```",
                    prepend: "```js\n",
                    char: "\n"
                }
            });
        }
    }
}