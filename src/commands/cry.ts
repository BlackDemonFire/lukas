import type { ColorResolvable } from "discord.js";
import { Message, MessageEmbed } from "discord.js";
import type { language as lang } from "src/types";
import { Bot } from "../bot.js";
import { GifCommand } from "../modules/command.js";
export default class Cry extends GifCommand {
    constructor(client: Bot) {
        super(client);
    }
    help = {
        show: true,
        name: "cry",
        usage: `${this.prefix}cry`,
        category: "gifs",
    }
    async run(client: Bot, message: Message, _args: string[], language: lang) {
        const gif: string = await client.db.getgif("cry", await client.db.getgiftype(message.author));
        let userA: string = await client.db.getname(message.author);
        const color: ColorResolvable = await client.db.getcolor(message.author);
        if (userA == "") userA = message.guild ? message.member!.displayName : message.author.username;
        const responseString: string = (await client.random.choice(language.command.cry.singleUser)).replace(/{a}/g, userA);
        const embed = new MessageEmbed()
            .setImage(gif)
            .setAuthor({ name: "cry" })
            .setDescription(responseString)
            .setColor(color);
        message.channel.send({ embeds: [embed] });
    }
}
