import { Bot } from "bot";
import { Message } from "discord.js";
import { Command } from "../modules/command";

export default class Gifaction extends Command {
    constructor(client: Bot) {
        super(client);
    }
    run(client: Bot, message: Message, args: string[], language: language) {
        var actions = client.db.getgifactions();
        var actionsstring: string
        switch (actions.length) {
            case 1:
                actionsstring = actions[0];
                break;
            case 2:
                actionsstring = actions.join(` ${language.general.and} `)
            default:
                break;
        }
        message.channel.send(language.command.gifactions.response.replace("{actions}", actionsstring))
    }
    help = {
        show: true,
        name: "gifaction",
        usage: `${this.prefix}gifaction`,
        category: "gifs"
    }
}