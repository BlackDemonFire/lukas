import { Bot } from "bot";
import { Message } from "discord.js";
import { Command } from "../modules/command";

export default class Giftype extends Command {
    constructor(client: Bot) {
        super(client)
    }
    run(client: Bot, message: Message, args: string[], language: language) {
        let giftype: string = args[0].toLowerCase();
        var types = ["anime"];
        if (!(types.includes(giftype))) {
            var typesstring
            switch (types.length) {
                case 1:
                    typesstring = types[0]
                    break;
                    case 2:
                        typesstring = types.join(` ${language.general.and} `)
                default:
                    break;
            }
            return message.channel.send(language.command.giftype.availableTypes.replace("{types}", typesstring));
        }
        client.db.setgiftype(message.author, giftype);
    }
    help = {
        show: true,
        name: "giftype",
        usage: `${this.prefix}giftype <type>`,
        category: "gifs"
    }
}