import { Bot } from "bot";
import { Message, MessageEmbed } from "discord.js";
import { GifCommand } from "../modules/command";

export default class Cry extends GifCommand {
    constructor(client: Bot) {
        super(client);
    }
    help = {
        show: true,
        name: "cuddle",
        usage: `${this.prefix}cry`,
        category: "gifs"
    }
    async run(client: Bot, message: Message, args: string[], language: language) {
        var gif: string = client.db.getgif("cry", client.db.getgiftype(message.author));
        var userA: string = client.db.getname(message.author);
        var color: string = client.db.getcolor(message.author);
        if (userA == "") userA = message.guild ? message.member.displayName : message.author.username;
        var userB: string = await super.parseUser(client, message, args, language);
        var responseString: string = (await client.random.choice(language.command.cry.singleUser)).replace(/{a}/g, userA);
        var embed = new MessageEmbed()
            .setImage(gif)
            .setAuthor("cry")
            .setDescription(responseString)
            .setColor(color);
        message.channel.send(embed);
    }
}
