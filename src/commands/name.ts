import { Bot } from "bot";
import { Message } from "discord.js";
import { Command } from "../modules/command";

export default class Name extends Command {
    constructor(client: Bot) {
        super(client);
    }
    run(client: Bot, message: Message, args: string[], language: language) {
        let newname: string;
        if (!args || args == []) {
            newname = "";
        } else {
            newname = args.join(" ");
        }
        client.db.setname(message.author, newname);
        message.channel.send(language.command.name.success.replace("{newname}", newname))
    }
    help = {
        show: true,
        name: "name",
        usage: `${this.prefix}name [name]`,
        category: "gifs"
    }
}