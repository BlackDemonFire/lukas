import { Bot } from "bot";
import { Message } from "discord.js";
import { Command } from "../modules/command";

export default class Newgif extends Command {
    constructor(client: Bot) {
        super(client)
    }
    run(client: Bot, message: Message, args: string[], language: language) {
        var response: string;
        if (!args || args.length !== 3) {
            response = language.command.newgif.wrongArgs;
        } else {
            let url: string = args[0];
            let action: string = args[1].toLowerCase();
            let type: string = args[2].toLowerCase();
            if (!type || type == "") type = "anime";
            client.db.newgif(url, action, type);
            response = language.command.newgif.success;
        }
        message.channel.send(response);
    }
    help = {
        show: true,
        name: "newgif",
        usage: `${this.prefix}newgif <url> <command> [type (defaults to anime)]`,
        category: "gifs"
    }
}