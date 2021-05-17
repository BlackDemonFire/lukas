import { Bot } from "bot";
import { Message, MessageEmbed } from "discord.js";
import { Command } from "../modules/command";

export default class Kill extends Command {
    constructor(client: Bot) {
        super(client);
    }
    help = {
        show: false,
        name: "kill",
        usage: `${this.prefix}kill`,
        category: "Owner only"
    }
    async run(client: Bot, message: Message, args: string[], language: language) {
        if (!super.isOwner(message)) return message.channel.send(language.command.kill.permissionError);
        if (message !== null) {
            const plaintext = language.command.kill.success;
            const embed = new MessageEmbed()
                .setImage("https://i.imgflip.com/19f1vf.jpg")
                .setColor(0x36393E)
                .setFooter("@" + message.author.username);
            await message.channel.send(plaintext, embed);
        }
        console.log("stopping bot...");
        client.destroy();
        process.exit();
    }
}