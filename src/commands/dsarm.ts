import { Bot } from "bot"
import { Message } from "discord.js"
import { Command } from "../modules/command"
export default class Dsarm extends Command {
    constructor(client: Bot) {
        super(client)
    }
    help = {
        show: true,
        name: "dsarm",
        usage: `${this.prefix}dsarm <character>`,
        category: "dsa"
    }
    run(client: Bot, message: Message, args: string[], language: language) {
        let pref: string = args.shift().slice().toLowerCase();
        if (!client.db.getDSAChar(pref)) return message.channel.send(language.command.dsarm.noSuchChar.replace("{pref}", pref));
        client.db.deleteDSAChar(pref);
        message.channel.send(language.command.dsarm.success.replace("{pref}", pref));
    }
}