import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  GuildChannel,
  Message,
  Team,
  User,
} from "discord.js";
import { Bot } from "../../bot.js";
import { Command } from "../../modules/command.js";
import { GifRequest, activeRequests } from "../../modules/dbo/gifRequest.js";
import type { ILanguage as lang } from "../../types.js";

export default class Newgif extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }

  async run(client: Bot, message: Message, args: string[], language: lang) {
    if (!args || args.length !== 3) {
      message.channel.send(language.command.newgif.wrongArgs);
      return;
    }
    const url: string = args[0];
    const action: string = args[1].toLowerCase();
    const type: string = args[2].toLowerCase();
    if (this.isOwner(message)) {
      client.db.newGif(url, action, type);
      message.channel.send(language.command.newgif.success);
      return;
    }
    const response: string = language.command.newgif.checking;
    const owner: Team | User = client.application!.owner!;
    let admins: User[];
    if (owner instanceof Team) {
      admins = owner.members.map((tmember) => tmember.user);
    } else {
      admins = [owner];
    }
    const requestMessage = await message.channel.send({ content: response });
    activeRequests.set(
      requestMessage.id,
      new GifRequest(
        requestMessage,
        requestMessage.id,
        message.channel.id,
        url,
        action,
        type,
      ),
    );
    for (const admin of admins) {
      admin.send({
        content: `Gif check request from ${message.author.tag} in <#${
          message.channel.id
        }> (${
          message.channel instanceof GuildChannel ? message.channel.name : "DM"
        })\ngif: ${url}\naction: ${action}\ntype: ${type}`,
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents([
            new ButtonBuilder()
              .setLabel("Accept")
              .setCustomId(`newgif.accept.${requestMessage.id}`)
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setLabel("Reject")
              .setCustomId(`newgif.reject.${requestMessage.id}`)
              .setStyle(ButtonStyle.Danger),
          ]),
        ],
      });
    }
  }

  help = {
    show: true,
    usage: `${this.prefix}newgif <url> <command> [type (defaults to anime)]`,
  };
}
