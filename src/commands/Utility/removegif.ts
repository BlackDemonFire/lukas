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
import type { ILanguage } from "../../types.js";
import logger from "../../modules/logger.js";

export default class Newgif extends Command {
  constructor(client: Bot, category: string, name: string) {
    super(client, category, name);
  }

  async run(
    client: Bot,
    message: Message,
    args: string[],
    language: ILanguage,
  ) {
    if (!message.channel.isSendable()) {
      logger.error(`channel ${message.channel.id} is not sendable`);
      return;
    }
    if (!args || args.length !== 1) {
      await message.channel.send(language.command.removegif.wrongArgs);
      return;
    }
    const url: string = args[0];
    if (this.isOwner(message)) {
      await client.db.removeGif(url);
      await message.channel.send(language.command.removegif.success);
      return;
    }
    const response: string = language.command.removegif.checking;
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
        null,
        null,
      ),
    );
    for (const admin of admins) {
      await admin.send({
        content: `Gif check request from ${message.author.tag} in <#${
          message.channel.id
        }> (${
          message.channel instanceof GuildChannel ? message.channel.name : "DM"
        })\ngif: ${url}`,
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents([
            new ButtonBuilder()
              .setLabel("Accept")
              .setCustomId(`removegif.accept.${requestMessage.id}`)
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setLabel("Reject")
              .setCustomId(`removegif.reject.${requestMessage.id}`)
              .setStyle(ButtonStyle.Danger),
          ]),
        ],
      });
    }
  }

  help = {
    show: true,
    usage: `${this.prefix}removegif <url>`,
  };
}
