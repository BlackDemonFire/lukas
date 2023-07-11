import { Message } from "discord.js";
import type { language as lang } from "src/types";
import { Bot } from "../bot.js";
import { Command } from "../modules/command.js";

export default class Giftype extends Command {
    constructor(client: Bot) {
        super(client);
    }
    async run(client: Bot, message: Message, args: string[], language: lang) {
        const giftype: string = args[0].toLowerCase();
        const types = ["anime"];
        if (!(types.includes(giftype))) {
            let typesstring = "";
            switch (types.length) {
                case 1:
                    typesstring = types[0];
                    break;
                case 2:
                    typesstring = types.join(` ${language.general.and} `);
                    break;
                default:
                    break;
            }
            message.channel.send({ content: language.command.giftype.availableTypes.replace("{types}", typesstring) });
            return;
        }
        client.db.setgiftype(message.author, giftype);
    }
    help = {
        show: true,
        name: "giftype",
        usage: `${this.prefix}giftype <type>`,
        category: "Utility",
    }
}