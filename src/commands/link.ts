import { Bot } from "bot";
import { Message, MessageEmbed, Permissions } from "discord.js";
import { Command } from "../modules/command";

export default class Link extends Command {
    constructor(client: Bot) {
        super(client);
    }
    async run(client: Bot, message: Message, args: string[], language: language) {
        const embed: MessageEmbed = new MessageEmbed()
            .setTitle("Links")
            .setDescription(`[Invite](${client.generateInvite({ additionalScopes: ["applications.commands"], permissions: Permissions.ALL })})\n[GitHub](https://github.com/BlackDemonFire/lukas.git)`)
            .setColor(0xaa7777);
        message.channel.send(embed);
    }
    help = {
        show: true,
        name: "link",
        usage: `${this.prefix}link`,
        category: "Utility"
    }
}
