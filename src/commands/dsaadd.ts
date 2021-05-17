import { Bot } from "bot"
import { Message } from "discord.js"
import { Command } from "../modules/command";
export default class dsaadd extends Command {
    constructor(client: Bot) {
        super(client)
    }
    help = {
        show: true,
        name: "dsaadd",
        usage: `${this.prefix}dsaadd <character> [avatar - if it doesn't start with \`http\`, it will be ignored.] <displayed name>`,
        category: "dsa"
    }
    run = (client: Bot, message: Message, args: string[], language: language) => {
        if (!args || args.length <= 3) return message.channel.send(language.command.dsaadd.args)
        let pref: string = args.shift().slice().toLowerCase();
        let img: string = args[0].includes("http") ? args.shift() : "";
        let name: string = args.join(" ");
        client.db.newDSAChar(pref, name, img);
        message.channel.send(language.command.dsaadd.success.replace("{pref}", pref));
    }
}