import { ColorResolvable, EmbedBuilder, Message } from "discord.js";
import type { ILanguage as lang } from "src/types";
import { Bot } from "../bot.js";
import { GifCommand } from "../modules/command.js";

export default class Purr extends GifCommand {
  constructor(client: Bot) {
    super(client);
  }
  help = {
    show: true,
    name: "purr",
    usage: `${this.prefix}purr`,
    category: "Gifs",
  };
  async run(client: Bot, message: Message, _args: string[], language: lang) {
    const gif: string = await client.db.getgif(
      "purr",
      await client.db.getgiftype(message.author),
    );
    let userA: string = await client.db.getname(message.author);
    const color: ColorResolvable = await client.db.getcolor(message.author);
    if (userA == "")
      userA = message.guild
        ? message.member!.displayName
        : message.author.username;
    const responseString: string = (
      await client.random.choice(language.command.purr.singleUser)
    ).replace(/{a}/g, userA);
    const embed = new EmbedBuilder()
      .setImage(gif)
      .setAuthor({ name: "purr" })
      .setDescription(responseString)
      .setColor(color);
    message.channel.send({ embeds: [embed] });
  }
}
