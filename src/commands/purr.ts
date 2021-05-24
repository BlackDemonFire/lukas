import { Bot } from "bot";
import { Message, MessageEmbed } from "discord.js";
import { GifCommand } from "../modules/command";

export default class Purr extends GifCommand {
    constructor(client: Bot) {
        super(client);
    }
    help = {
        show: true,
        name: "purr",
        usage: `${this.prefix}purr`,
        category: "gifs"
    }
    async run(client: Bot, message: Message, args: string[], language: language) {
        var gif: string = client.db.getgif("purr", client.db.getgiftype(message.author));
        var userA: string = client.db.getname(message.author);
        var color: string = client.db.getcolor(message.author);
        if (userA == "") userA = message.guild ? message.member.displayName : message.author.username;
        var userB: string = await super.parseUser(client, message, args, language);
        var responseString: string = (await client.random.choice(language.command.purr.singleUser)).replace(/{a}/g, userA);
        var embed = new MessageEmbed()
            .setImage(gif)
            .setAuthor("purr")
            .setDescription(responseString)
            .setColor(color);
        message.channel.send(embed);
    }
}
