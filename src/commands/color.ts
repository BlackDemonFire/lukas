import { Message } from "discord.js";
import { Bot } from "../bot.js";
import { Command } from "../modules/command.js";
import type { language as lang } from "../types";

export default class Color extends Command {
    constructor(client: Bot) {
        super(client);
    }
    run(client: Bot, message: Message, args: string[], language: lang) {
        let color: string;
        if (args && args.length > 0) {
            color = args[0];
        } else {
            color = "RANDOM";
        }
        client.db.setcolor(message.author, color);
        message.channel.send(language.command.color.success);
    }
    help = {
        show: true,
        name: "color",
        usage: `${this.prefix}color [color]`,
        category: "gifs",
    }
}