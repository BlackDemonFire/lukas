import { Bot } from "bot";
import { Message, MessageEmbed } from "discord.js";
import { Command } from "../modules/command";
import { inspect } from "util";
import { restart } from "../execrestart";

export default class Restart extends Command {
    constructor(client: Bot) {
        super(client)
    }
    help = {
        show: false,
        name: "restart",
        usage: `${this.prefix}restart`,
        category: "Owner only"
    }
    async run(client: Bot, message: Message, args: string[], language: language) {
        //code
        if (message !== null) {
            var msg = await message.channel.send("<a:load_1:498280749271744512> " + language.command.restart.start);
        } else {
            msg = null
        }
        console.log("restarting bot...")
        try {
            restart(client, msg, "<:check_4:498523284804075541> " + language.command.restart.success)
        } catch (error) {
            console.error(error)
            var resErr = inspect(error)
            const embed = new MessageEmbed()
                .setFooter("@" + message.author.username)
                .setColor(0xffcc4d)
                .setAuthor("Restart")
                .setDescription(resErr)
            if (msg) msg.edit("⚠ " + language.command.restart.error, embed)
        }

    }
}