import type { ColorResolvable } from "discord.js";
import { EmbedBuilder, Message } from "discord.js";
import { Bot } from "../../bot.js";
import { GifCommand } from "../../modules/command.js";
import type { ILanguage as lang } from "../../types.js";

export default class Blush extends GifCommand {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  help = {
    show: true,
    usage: `${this.prefix}blush`,
  };

  async run(client: Bot, message: Message, _args: string[], language: lang) {
    const gif: string = await client.db.getgif(
      "blush",
      await client.db.getgiftype(message.author),
    );
    let userA: string = await client.db.getname(message.author);
    const color: ColorResolvable = await client.db.getcolor(message.author);
    if (userA == "")
      userA = message.guild
        ? message.member!.displayName
        : message.author.username;
    const responseString: string = (
      await client.random.choice(language.command.blush.singleUser)
    ).replace(/{a}/g, userA);
    const embed = new EmbedBuilder()
      .setImage(gif)
      .setAuthor({ name: "blush" })
      .setDescription(responseString)
      .setColor(color);
    message.channel.send({ embeds: [embed] });
  }
}
