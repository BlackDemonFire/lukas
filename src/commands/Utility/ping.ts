import { EmbedBuilder, Message } from "discord.js";
import { Bot } from "../../bot.js";
import { Command } from "../../modules/command.js";
import logger from "../../modules/logger.js";
import type { ILanguage as lang } from "../../types.js";

export default class Ping extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }
  help = {
    show: true,
    usage: `${this.prefix}ping`,
  };
  async run(client: Bot, message: Message, _args: string[], language: lang) {
    let gif;
    const commandusage: Array<number> = client.commandusage.get(
      message.author.id,
    )!;
    if (commandusage.length == 3) {
      logger.debug(commandusage[2] + "|" + commandusage[0]);
      const diff = commandusage[2] - commandusage[0];
      logger.debug(diff);
      if (diff < 600000) {
        gif = true;
        commandusage.shift();
        client.commandusage.set(message.author.id, commandusage);
      } else {
        client.commandusage.set(message.author.id, []);
      }
    }
    // code
    const embed = new EmbedBuilder();

    if (super.isAprilFools()) {
      embed
        .setColor(0x7289da)
        .setDescription(message.author.toString())
        .setAuthor({
          name: `Ping: @${
            message.member
              ? message.member.displayName
              : message.author.username
          }`,
        })
        .setFooter({
          text: `@${
            message.member
              ? message.member.displayName
              : message.author.username
          }`,
          iconURL: message.author.defaultAvatarURL,
        });
      await message.channel.send({
        content: message.author.toString(),
        embeds: [embed],
      });
    } else {
      const msg: Message | void = await message.channel
        .send({
          content: `${client.emojis.resolve("498280749271744512")} Ping?`,
        })
        .catch((e) => {
          logger.error(e);
        });
      if (!msg) return;
      embed
        .setColor(0x7289da)
        .setDescription(
          `${language.command.ping.apiLatency} ${Math.round(
            client.ws.ping,
          )}ms.`,
        )
        .setAuthor({
          name: `${language.command.ping.latency} ${
            msg.createdTimestamp - message.createdTimestamp
          }ms.`,
        })
        .setFooter({ text: `@${message.author.username}` });
      if (gif)
        embed.setImage(
          "https://cdn.discordapp.com/attachments/605382573413236758/744671452267282472/Alert.gif",
        );
      await msg.edit({
        content: "<:check_4:498523284804075541> Pong!",
        embeds: [embed],
      });
    }
  }
}
