import type { ColorResolvable } from "discord.js";
import { Message, MessageEmbed } from "discord.js";
import { Bot } from "../bot.js";
import { GifCommand } from "../modules/command.js";
import type { language as lang } from "../types";

export default class Blush extends GifCommand {
    constructor(client: Bot) {
        super(client);
    }
    help = {
        show: true,
        name: "blush",
        usage: `${this.prefix}blush`,
        category: "gifs",
    }

    async run(client: Bot, message: Message, _args: string[], language: lang) {
        const gif: string = await client.db.getgif("blush", await client.db.getgiftype(message.author));
        let userA: string = await client.db.getname(message.author);
        const color: ColorResolvable = await client.db.getcolor(message.author);
        if (userA == "") userA = message.guild ? message.member!.displayName : message.author.username;
        const responseString: string = (await client.random.choice(language.command.blush.singleUser)).replace(/{a}/g, userA);
        const embed = new MessageEmbed()
            .setImage(gif)
            .setAuthor({ name: "blush" })
            .setDescription(responseString)
            .setColor(color);
        message.channel.send({ embeds: [embed] });
    }
}
