import type { ColorResolvable } from "discord.js";
import { Message, MessageEmbed } from "discord.js";
import type { language as lang } from "src/types";
import { Bot } from "../bot.js";
import { GifCommand } from "../modules/command.js";

export default class Kiss extends GifCommand {
  constructor(client: Bot) {
    super(client);
  }
  help = {
    show: true,
    name: "kiss",
    usage: `${this.prefix}kiss [user]`,
    category: "gifs",
  };
  async run(client: Bot, message: Message, args: string[], language: lang) {
    const gif: string = await client.db.getgif(
      "kiss",
      await client.db.getgiftype(message.author),
    );
    let userA: string = await client.db.getname(message.author);
    const color: ColorResolvable = await client.db.getcolor(message.author);
    if (userA == "")
      userA = message.guild
        ? message.member!.displayName
        : message.author.username;
    const userB: string = await super.parseUser(
      client,
      message,
      args,
      language,
    );
    let responseString = "";
    if (userB == "") {
      responseString = (
        await client.random.choice(language.command.kiss.singleUser)
      ).replace(/{a}/g, userA);
    } else {
      responseString = (
        await client.random.choice(language.command.kiss.multiUser)
      )
        .replace(/{a}/g, userA)
        .replace(/{b}/g, userB);
    }
    const embed = new MessageEmbed()
      .setImage(gif)
      .setAuthor({ name: "kiss" })
      .setDescription(responseString)
      .setColor(color);
    message.channel.send({ embeds: [embed] });
  }
}
